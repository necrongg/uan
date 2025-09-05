package com.example.uanhr.service;

import com.example.uanhr.entity.Album;
import com.example.uanhr.entity.Photo;
import com.example.uanhr.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.net.ssl.*;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.cert.X509Certificate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NasUploadService {

    @Value("${nas.url}")
    private String nasUrl;

    @Value("${nas.user}")
    private String nasUser;

    @Value("${nas.pass}")
    private String nasPass;

    @Value("${nas.upload.path}")
    private String nasUploadPath;

    @Value("${nas.img.read.path}")
    private String nasReadPath;

    private final PhotoRepository photoRepository;

    // 로그인 후 sid 발급
    private String loginAndGetSid() throws Exception {
        trustAllCertificates(); // HTTPS 인증서 무시

        String loginUrl = nasUrl + "/webapi/auth.cgi"
                + "?api=SYNO.API.Auth&version=6&method=login"
                + "&account=" + URLEncoder.encode(nasUser, StandardCharsets.UTF_8)
                + "&passwd=" + URLEncoder.encode(nasPass, StandardCharsets.UTF_8)
                + "&session=FileStation&format=cookie";

        HttpURLConnection conn = (HttpURLConnection) new URL(loginUrl).openConnection();
        conn.setRequestMethod("GET");

        try (BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) sb.append(line);

            String res = sb.toString();
            if (!res.contains("\"success\":true")) {
                throw new RuntimeException("로그인 실패: " + res);
            }

            int sidIndex = res.indexOf("\"sid\":\"") + 7;
            int sidEnd = res.indexOf("\"", sidIndex);
            return res.substring(sidIndex, sidEnd);
        }
    }

    public Photo uploadFileAndSave(MultipartFile file,
                                   String title,
                                   String description,
                                   String tags,
                                   String location,
                                   Album album) throws Exception {

        String sid = loginAndGetSid();
        trustAllCertificates();

        String boundary = "----WebKitFormBoundary" + System.currentTimeMillis();
        URL url = new URL(nasUrl + "/webapi/entry.cgi?api=SYNO.FileStation.Upload&version=2&method=upload");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setDoOutput(true);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Cookie", "id=" + sid);
        conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

        // 랜덤 파일명
        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        String randomFileName = UUID.randomUUID().toString().replace("-", "") + extension;

        try (OutputStream out = conn.getOutputStream();
             PrintWriter writer = new PrintWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8), true);
             InputStream inputStream = file.getInputStream()) {

            // path
            writer.append("--").append(boundary).append("\r\n");
            writer.append("Content-Disposition: form-data; name=\"path\"\r\n\r\n");
            writer.append(nasUploadPath).append("\r\n");

            // create_parents
            writer.append("--").append(boundary).append("\r\n");
            writer.append("Content-Disposition: form-data; name=\"create_parents\"\r\n\r\n");
            writer.append("true").append("\r\n");

            // overwrite
            writer.append("--").append(boundary).append("\r\n");
            writer.append("Content-Disposition: form-data; name=\"overwrite\"\r\n\r\n");
            writer.append("false").append("\r\n");

            // file
            writer.append("--").append(boundary).append("\r\n");
            writer.append("Content-Disposition: form-data; name=\"file\"; filename=\"")
                    .append(randomFileName).append("\"\r\n");
            writer.append("Content-Type: application/octet-stream\r\n\r\n");
            writer.flush();

            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
            out.flush();
            writer.append("\r\n").flush();

            writer.append("--").append(boundary).append("--").append("\r\n");
            writer.flush();
        }

        // 업로드 확인 (간단히 response 읽기)
        try (BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) sb.append(line);
        }

        // 업로드된 파일 URL
        String uploadedFileUrl = nasReadPath + "/" + randomFileName;

        // DB 저장
        Photo photo = Photo.builder()
                .album(album)
                .title(title)
                .description(description)
                .tags(tags)
                .location(location)
                .fileUrl(uploadedFileUrl)
                .uploadedDate(LocalDateTime.now())
                .build();

        return photoRepository.save(photo);
    }

    // HTTPS 인증서 무시
    private void trustAllCertificates() throws Exception {
        TrustManager[] trustAllCerts = new TrustManager[]{new X509TrustManager() {
            public void checkClientTrusted(X509Certificate[] certs, String authType) {}
            public void checkServerTrusted(X509Certificate[] certs, String authType) {}
            public X509Certificate[] getAcceptedIssuers() { return null; }
        }};
        SSLContext sc = SSLContext.getInstance("SSL");
        sc.init(null, trustAllCerts, new java.security.SecureRandom());
        HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
        HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);
    }
}
