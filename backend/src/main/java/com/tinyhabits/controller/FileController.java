package com.tinyhabits.controller;

import com.tinyhabits.common.Result;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/file")
public class FileController {

    @Value("${file.upload.path:uploads}")
    private String uploadPath;

    @Value("${server.port:8081}")
    private String serverPort;

    /**
     * 应用启动时自动创建上传目录
     */
    @PostConstruct
    public void init() {
        try {
            Path uploadDir = Paths.get(uploadPath);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
                System.out.println("✅ 上传目录创建成功: " + uploadDir.toAbsolutePath());
            } else {
                System.out.println("✅ 上传目录已存在: " + uploadDir.toAbsolutePath());
            }
        } catch (IOException e) {
            System.err.println("❌ 创建上传目录失败: " + e.getMessage());
            throw new RuntimeException("无法创建上传目录", e);
        }
    }

    /**
     * 文件上传接口
     * 支持图片上传（头像、图标等）
     */
    @PostMapping("/upload")
    public Result<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        try {
            // 验证文件
            if (file.isEmpty()) {
                return Result.error(400, "文件不能为空");
            }

            // 验证文件类型（只允许图片）
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return Result.error(400, "只支持图片格式");
            }

            // 验证文件大小（最大5MB）
            long maxSize = 5 * 1024 * 1024; // 5MB
            if (file.getSize() > maxSize) {
                return Result.error(400, "文件大小不能超过5MB");
            }

            // 获取原始文件名和扩展名
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            // 生成唯一文件名
            String filename = UUID.randomUUID().toString() + extension;

            // 保存文件（目录已在 @PostConstruct 中创建）
            Path filePath = Paths.get(uploadPath).resolve(filename);
            file.transferTo(filePath.toFile());

            // 动态生成访问URL（使用请求的 Host）
            String scheme = request.getScheme(); // http 或 https
            String serverName = request.getServerName(); // 服务器地址
            int serverPort = request.getServerPort(); // 端口
            
            String url;
            if ((scheme.equals("http") && serverPort == 80) || (scheme.equals("https") && serverPort == 443)) {
                url = scheme + "://" + serverName + "/uploads/" + filename;
            } else {
                url = scheme + "://" + serverName + ":" + serverPort + "/uploads/" + filename;
            }

            // 返回结果
            Map<String, String> result = new HashMap<>();
            result.put("url", url);
            result.put("filename", filename);
            result.put("originalFilename", originalFilename);
            result.put("size", String.valueOf(file.getSize()));
            result.put("contentType", contentType);

            return Result.success(result);

        } catch (IOException e) {
            return Result.error("文件上传失败: " + e.getMessage());
        }
    }

    /**
     * 删除文件接口（可选）
     */
    @DeleteMapping("/delete")
    public Result<Void> deleteFile(@RequestParam("filename") String filename) {
        try {
            // 安全检查：防止路径遍历攻击
            if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                return Result.error(400, "非法的文件名");
            }

            Path filePath = Paths.get(uploadPath).resolve(filename);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                return Result.success();
            } else {
                return Result.error(404, "文件不存在");
            }
        } catch (IOException e) {
            return Result.error("文件删除失败: " + e.getMessage());
        }
    }
}
