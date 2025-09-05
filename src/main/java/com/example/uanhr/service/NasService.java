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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NasService {

    @Value("${nas.url}")
    private String nasUrl;

    @Value("${nas.user}")
    private String nasUser;

    @Value("${nas.pass}")
    private String nasPass;

    @Value("${nas.upload.path}")
    private String nasPath;

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

    // 파일 업로드
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
            writer.append(nasPath).append("\r\n");

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

    // NAS에 있는 폴더의 파일 리스트 가져오기
    public List<String> listPhotos() throws Exception {
        String sid = loginAndGetSid();
        trustAllCertificates();

        String urlStr = nasUrl + "/webapi/entry.cgi?api=SYNO.FileStation.List&version=2&method=list"
                + "&folder_path=" + nasPath
                + "&sort_by=name&sort_direction=asc&additional=file_size,real_path"
                + "&_sid=" + sid;

        HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();
        conn.setRequestMethod("GET");

        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        StringBuilder sb = new StringBuilder(); String line;
        while ((line = in.readLine()) != null) sb.append(line);
        in.close();

        String res = sb.toString();
        // 간단히 파일명만 추출 (정규식 혹은 JSON 파싱 가능)
        List<String> files = new ArrayList<>();
        int index = 0;
        while ((index = res.indexOf("\"name\":\"", index)) != -1) {
            int start = index + 8;
            int end = res.indexOf("\"", start);
            String fileName = res.substring(start, end);
            files.add(nasUrl + "/web" + nasPath + "/" + fileName);
            index = end;
        }
        return files;
    }
}
