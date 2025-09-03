package com.example.uanhr.service;

import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class NasService {

    private final OkHttpClient client = new OkHttpClient.Builder()
            .hostnameVerifier((hostname, session) -> true) // SSL 자체서명 인증서 무시
            .build();

    @Value("${nas.url}")         // 예: https://upload.inku.i234.me/webapi
    private String nasUrl;

    @Value("${nas.user}")
    private String nasUser;

    @Value("${nas.pass}")
    private String nasPass;

    @Value("${nas.upload-path}") // 예: /docker/web/photos
    private String uploadPath;

    private String loginToNAS() throws IOException {
        HttpUrl url = HttpUrl.parse(nasUrl + "/auth.cgi").newBuilder()
                .addQueryParameter("api", "SYNO.API.Auth")
                .addQueryParameter("version", "6")
                .addQueryParameter("method", "login")
                .addQueryParameter("account", nasUser)
                .addQueryParameter("passwd", nasPass)
                .addQueryParameter("session", "FileStation")
                .addQueryParameter("format", "cookie") // ✅ cookie 로 받아야 함
                .build();

        Request request = new Request.Builder().url(url).get().build();
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException("NAS 로그인 실패: " + response.body().string());
            }
            // ✅ sid 는 Set-Cookie 로 내려옴
            String setCookie = response.header("Set-Cookie");
            if (setCookie == null || !setCookie.contains("id=")) {
                throw new RuntimeException("NAS 로그인 쿠키 획득 실패");
            }
            return setCookie.split(";", 2)[0]; // "id=xxxxx"
        }
    }

    public String uploadFile(MultipartFile file) throws IOException {
        String cookie = loginToNAS();

        RequestBody fileBody = RequestBody.create(file.getBytes(), MediaType.parse("application/octet-stream"));

        MultipartBody requestBody = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("path", uploadPath)
                .addFormDataPart("create_parents", "true")
                .addFormDataPart("overwrite", "true")
                .addFormDataPart("file", file.getOriginalFilename(), fileBody)
                .build();

        HttpUrl url = HttpUrl.parse(nasUrl + "/entry.cgi").newBuilder()
                .addQueryParameter("api", "SYNO.FileStation.Upload")
                .addQueryParameter("version", "2")
                .addQueryParameter("method", "upload")
                .build();

        Request request = new Request.Builder()
                .url(url)
                .addHeader("Cookie", cookie) // ✅ 쿠키에 sid 전달
                .post(requestBody)
                .build();

        try (Response response = client.newCall(request).execute()) {
            String body = response.body().string();
            if (!response.isSuccessful()) {
                throw new RuntimeException("NAS 업로드 실패: " + body);
            }
            return getFileUrl(file.getOriginalFilename());
        }
    }

    public String getFileUrl(String fileName) {
        return "https://upload.inku.i234.me/web" + uploadPath + "/" + fileName;
    }
}
