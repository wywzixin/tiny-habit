import { Canvas, Skia, Shader, Rect, useClock } from '@shopify/react-native-skia';
import { useWindowDimensions } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';

const fireworksSource = Skia.RuntimeEffect.Make(`
uniform float iTime;
uniform vec2 iResolution;

const float PI = 3.141592653589793;
const float EXPLOSION_COUNT = 6.0;
const float SPARKS_PER_EXPLOSION = 80.0;
const float EXPLOSION_DURATION = 18.0;
const float EXPLOSION_SPEED = 4.0;
const float EXPLOSION_RADIUS_THESHOLD = 0.08;

const vec3 MOD3 = vec3(0.1031, 0.11369, 0.13787);

vec3 hash31(float p) {
   vec3 p3 = fract(vec3(p) * MOD3);
   p3 += dot(p3, p3.yzx + 19.19);
   return fract(vec3((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y, (p3.y + p3.z) * p3.x));
}

vec4 main(vec2 fragCoord) {
    float aspectRatio = iResolution.x / iResolution.y;
    vec2 uv = fragCoord / iResolution.y;
    float t = mod(iTime + 10.0, 7200.0);
    vec3 col = vec3(0.0);
    vec2 origin = vec2(0.0);

    for (float j = 0.0; j < EXPLOSION_COUNT; j += 1.0) {
        vec3 oh = hash31((j + 1234.1939) * 641.6974);
        origin = vec2(oh.x, oh.y) * 0.6 + 0.2;
        origin.x *= aspectRatio;
        float localT = t + (j + 1.0) * 9.6491 * oh.z;

        for (float i = 0.0; i < SPARKS_PER_EXPLOSION; i += 1.0) {
            vec3 h = hash31(j * 963.31 + i + 497.8943);
            float a = h.x * PI * 2.0;
            float rScale = h.y * EXPLOSION_RADIUS_THESHOLD;

            if (mod(localT * EXPLOSION_SPEED, EXPLOSION_DURATION) > 2.0) {
                float r = mod(localT * EXPLOSION_SPEED, EXPLOSION_DURATION) * rScale;
                vec2 sparkPos = vec2(r * cos(a), r * sin(a));
                float poopoo = 0.04;
                float peepee = (length(sparkPos) - (rScale - poopoo)) / poopoo;
                sparkPos.y -= pow(peepee, 3.0) * 6e-5;
                float spark = 0.0003 / pow(length(uv - sparkPos - origin), 1.8);
                float sd = 2.0 * length(origin - sparkPos);
                float shimmer = max(0.0, sqrt(sd) * (sin((localT + h.y * 2.0 * PI) * 20.0)));
                float shimmerThreshold = EXPLOSION_DURATION * 0.32;
                float fade = max(0.0, (EXPLOSION_DURATION - 5.0) * rScale - r);
                col += spark * mix(1.0, shimmer, smoothstep(shimmerThreshold * rScale,
                    (shimmerThreshold + 1.0) * rScale, r)) * fade * oh;
            }
        }
    }

    // 完全透明的背景，只有烟花粒子可见
    float brightness = col.r + col.g + col.b;

    // 如果亮度太低，返回完全透明
    if (brightness < 0.02) {
        return vec4(0.0, 0.0, 0.0, 0.0);
    }

    // 增强烟花颜色，使用亮度作为 alpha
    float alpha = min(1.0, brightness);
    return vec4(col * 1.2, alpha);
}
`);

interface FireworksShaderProps {
  width?: number;
  height?: number;
}

export function FireworksShader({ width, height }: FireworksShaderProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const w = width ?? windowWidth;
  const h = height ?? windowHeight;

  const clock = useClock();

  const uniforms = useDerivedValue(() => ({
    iTime: clock.value / 1000,
    iResolution: [w, h],
  }), [clock, w, h]);

  if (!fireworksSource) {
    return null;
  }

  return (
    <Canvas style={{ width: w, height: h }}>
      <Rect x={0} y={0} width={w} height={h}>
        <Shader source={fireworksSource} uniforms={uniforms} />
      </Rect>
    </Canvas>
  );
}
