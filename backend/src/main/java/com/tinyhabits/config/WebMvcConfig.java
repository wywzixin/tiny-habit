package com.tinyhabits.config;

import com.tinyhabits.interceptor.JwtInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final JwtInterceptor jwtInterceptor;

    @Value("${file.upload.path:uploads}")
    private String uploadPath;

    public WebMvcConfig(JwtInterceptor jwtInterceptor) {
        this.jwtInterceptor = jwtInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/user/register",
                        "/api/user/login",
                        "/api/user/reset-password",
                        "/api/library/habits",  // 习惯库公开访问
                        "/api/library/recipes/with-status",  // 旧接口保留兼容
                        "/api/file/upload",  // 文件上传公开访问
                        "/api/ai/**"  // AI 接口公开访问（测试用）
                );
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 配置静态资源访问路径
        // 确保路径以 / 结尾
        String location = uploadPath.endsWith("/") || uploadPath.endsWith("\\") 
            ? "file:" + uploadPath 
            : "file:" + uploadPath + "/";
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);
        
        System.out.println("✅ 静态资源映射配置: /uploads/** -> " + location);
    }
}
