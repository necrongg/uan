package com.example.uanhr.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.net.ssl.*;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.security.cert.X509Certificate;

@Service
public class NasService {

    @Value("${nas.url}")
    private String nasUrl;

    @Value("${nas.user}")
    private String nasUser;

    @Value("${nas.pass}")
    private String nasPass;

    @Value("${nas.upload.path}")
    private String nasPath;

    // 로그인 후 sid 발급
    private String loginAndGetSid() throws Exception {
        trustAllCertificates(); // HTTPS 인증서 무시

        String loginUrl = nasUrl + "/webapi/auth.cgi"
                + "?api=SYNO.API.Auth&version=6&method=login"
                + "&account=" + URLEncoder.encode(nasUser, "UTF-8")
                + "&passwd=" + URLEncoder.encode(nasPass, "UTF-8")
                + "&session=FileStation&format=cookie";

        HttpURLConnection conn = (HttpURLConnection) new URL(loginUrl).openConnection();
        conn.setRequestMethod("GET");

        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = in.readLine()) != null) sb.append(line);
        in.close();

        String res = sb.toString();
        if (!res.contains("\"success\":true")) {
            throw new RuntimeException("로그인 실패: " + res);
        }

        // sid 추출
        int sidIndex = res.indexOf("\"sid\":\"") + 7;
        int sidEnd = res.indexOf("\"", sidIndex);
        return res.substring(sidIndex, sidEnd);
    }

    public String uploadFile(MultipartFile file) throws Exception {
        String sid = loginAndGetSid();

        trustAllCertificates(); // HTTPS 인증서 무시

        String boundary = "----WebKitFormBoundary" + System.currentTimeMillis();
        URL url = new URL(nasUrl + "/webapi/entry.cgi?api=SYNO.FileStation.Upload&version=2&method=upload");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setDoOutput(true);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Cookie", "id=" + sid);
        conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

        try (OutputStream out = conn.getOutputStream();
             PrintWriter writer = new PrintWriter(new OutputStreamWriter(out, "UTF-8"), true)) {

            // path
            writer.append("--").append(boundary).append("\r\n");
            writer.append("Content-Disposition: form-data; name=\"path\"\r\n\r\n");
            writer.append(nasPath).append("\r\n");

            // create_parents
            writer.append("--").append(boundary).append("\r\n");
            writer.append("Content-Disposition: form-data; name=\"create_parents\"\r\n\r\n");
            writer.append("true").append("\r\n");

            // file
            writer.append("--").append(boundary).append("\r\n");
            writer.append("Content-Disposition: form-data; name=\"file\"; filename=\"")
                    .append(file.getOriginalFilename()).append("\"\r\n");
            writer.append("Content-Type: application/octet-stream\r\n\r\n");
            writer.flush();

            InputStream inputStream = file.getInputStream();
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
            out.flush();
            inputStream.close();
            writer.append("\r\n").flush();

            writer.append("--").append(boundary).append("--").append("\r\n");
            writer.flush();
        }

        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = in.readLine()) != null) sb.append(line);
        in.close();

        // 업로드된 파일 URL
        String uploadedFileUrl = nasUrl + "/web" + nasPath + "/" + file.getOriginalFilename();
        return uploadedFileUrl;
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
