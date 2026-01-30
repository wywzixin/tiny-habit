package com.tinyhabits.config;

import ai.z.openapi.ZhipuAiClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ZhipuAiConfig {

    @Value("${zhipuai.api-key}")
    private String apiKey;

    @Bean
    public ZhipuAiClient zhipuAiClient() {
        return ZhipuAiClient.builder()
                .ofZHIPU()
                .apiKey(apiKey)
                .build();
    }
}
