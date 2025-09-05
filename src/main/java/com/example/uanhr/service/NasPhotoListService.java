package com.example.uanhr.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.net.ssl.*;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NasPhotoListService {

    @Value("${nas.url}")
    private String nasUrl;

    @Value("${nas.user}")
    private String nasUser;

    @Value("${nas.pass}")
    private String nasPass;

    @Value("${nas.upload.path}")
    private String nasPath;

    // 로그인 후 sid 발급 (기존 loginAndGetSid 재사용)
    private String loginAndGetSid() throws Exception {
        trustAllCertificates();
        String loginUrl = nasUrl + "/webapi/auth.cgi"
                + "?api=SYNO.API.Auth&version=6&method=login"
                + "&account=" + nasUser
                + "&passwd=" + nasPass
                + "&session=FileStation&format=cookie";
        HttpURLConnection conn = (HttpURLConnection) new URL(loginUrl).openConnection();
        conn.setRequestMethod("GET");
        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        StringBuilder sb = new StringBuilder(); String line;
        while ((line = in.readLine()) != null) sb.append(line);
        in.close();
        String res = sb.toString();
        int sidIndex = res.indexOf("\"sid\":\"") + 7;
        int sidEnd = res.indexOf("\"", sidIndex);
        return res.substring(sidIndex, sidEnd);
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
