package com.example.uanhr.service;

import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class NasService {

    private final OkHttpClient client = new OkHttpClient.Builder()
            // 자체 서명 인증서 허용 (정식 SSL 적용 시 제거 가능)
            .hostnameVerifier((hostname, session) -> true)
            .build();

    @Value("${nas.url}")
    private String nasUrl;

    @Value("${nas.user}")
    private String nasUser;

    @Value("${nas.pass}")
    private String nasPass;

    @Value("${nas.upload-path}")
    private String uploadPath;

    /** 로그인 → sid 반환 */
    private String loginToNAS() throws IOException {
        HttpUrl url = HttpUrl.parse(nasUrl + "/auth.cgi").newBuilder()
                .addQueryParameter("api", "SYNO.API.Auth")
                .addQueryParameter("version", "6")
                .addQueryParameter("method", "login")
                .addQueryParameter("account", nasUser)
                .addQueryParameter("passwd", nasPass)
                .addQueryParameter("session", "FileStation")
                .addQueryParameter("format", "sid")
                .build();

        Request request = new Request.Builder().url(url).get().build();
        try (Response response = client.newCall(request).execute()) {
            String body = response.body().string();
            if (body.contains("\"sid\"")) {
                return body.split("\"sid\":\"")[1].split("\"")[0];
            }
            throw new RuntimeException("Login failed: " + body);
        }
    }

    /** 파일 업로드 */
    public String uploadFile(MultipartFile file) throws IOException {
        String sid = loginToNAS();

        RequestBody fileBody = RequestBody.create(
                file.getBytes(),
                MediaType.parse("application/octet-stream")
        );

        MultipartBody requestBody = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("api", "SYNO.FileStation.Upload")
                .addFormDataPart("version", "2")
                .addFormDataPart("method", "upload")
                .addFormDataPart("path", uploadPath)
                .addFormDataPart("create_parents", "true")
                .addFormDataPart("overwrite", "true")
                .addFormDataPart("sid", sid)
                .addFormDataPart("file", file.getOriginalFilename(), fileBody)
                .build();

        Request request = new Request.Builder()
                .url(nasUrl + "/entry.cgi")
                .post(requestBody)
                .build();

        try (Response response = client.newCall(request).execute()) {
            return response.body().string();
        }
    }
}
