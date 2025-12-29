from PIL import Image, ImageDraw
import numpy as np

def remove_bg_safe(img, bg_color, tolerance=50):
    img = img.convert("RGBA")
    data = np.array(img)
    
    # [수정됨] data.T 대신 직접 슬라이싱을 사용하여 가로/세로 뒤바뀜 방지
    # data shape: (Height, Width, 4)
    r = data[:, :, 0]
    g = data[:, :, 1]
    b = data[:, :, 2]
    
    tr, tg, tb = bg_color[:3]
    
    # 벡터 연산으로 색상 거리 계산
    # int32로 변환하여 오버플로우 방지
    diff = np.sqrt((r.astype(np.int32) - tr)**2 + 
                   (g.astype(np.int32) - tg)**2 + 
                   (b.astype(np.int32) - tb)**2)
    
    # 마스크 생성
    mask = diff < tolerance
    
    # 알파 채널에 마스크 적용
    data[:, :, 3][mask] = 0
    
    return Image.fromarray(data)

def process_final(src_img, ref_img, bg_pos, prefix):
    # 1. 배경색 추출 및 제거
    bg_color = src_img.getpixel(bg_pos)
    img_trans = remove_bg_safe(src_img, bg_color)
    
    # 디버그 1: 배경 제거 확인
    img_trans.save(f"debug_{prefix}_01_crop.png")
    
    # 2. 유효 영역(BBox) 찾기 (하단 텍스트 및 여백 자동 제거)
    bbox = img_trans.getbbox()
    if not bbox:
        return None
    
    content = img_trans.crop(bbox)
    
    # 3. 그리드 설정
    # boy_run (타겟)
    t_w, t_h = ref_img.size
    t_cw, t_ch = t_w // 4, t_h // 4
    
    # Rocket (소스) - 현재 content 이미지를 4x4로 가정
    s_w, s_h = content.size
    s_cw, s_ch = s_w // 4, s_h // 4
    
    # 디버그 2: 그리드 확인용 이미지 생성
    debug_grid = content.copy()
    draw = ImageDraw.Draw(debug_grid)
    for i in range(1, 4):
        draw.line([(i * s_cw, 0), (i * s_cw, s_h)], fill="red")
        draw.line([(0, i * s_ch), (s_w, i * s_ch)], fill="red")
    debug_grid.save(f"debug_{prefix}_02_grid.png")

    # 4. 최종 이미지 생성
    final_img = Image.new("RGBA", (t_w, t_h))
    
    for row in range(4):
        for col in range(4):
            # 소스 셀 추출
            sx, sy = col * s_cw, row * s_ch
            src_cell = content.crop((sx, sy, sx + s_cw, sy + s_ch))
            
            # 캐릭터 알맹이만 다시 크롭
            char_bbox = src_cell.getbbox()
            if char_bbox:
                char = src_cell.crop(char_bbox)
                
                # 리사이징 계산 (타겟 셀 안에 꽉 차게)
                # 타겟 높이의 90% 정도로 맞춤
                target_h_size = int(t_ch * 0.95)
                ratio = target_h_size / char.height
                new_w = int(char.width * ratio)
                new_h = int(char.height * ratio)
                
                # 만약 너비가 너무 넓으면 너비 기준으로 다시 조절
                if new_w > t_cw:
                    ratio = (t_cw * 0.95) / char.width
                    new_w = int(char.width * ratio)
                    new_h = int(char.height * ratio)
                
                # 최소 1픽셀 보장 및 리사이징
                new_w, new_h = max(1, new_w), max(1, new_h)
                char_resized = char.resize((new_w, new_h), resample=Image.NEAREST)
                
                # 중앙 배치
                dx = (col * t_cw) + (t_cw - new_w) // 2
                dy = (row * t_ch) + (t_ch - new_h) // 2
                
                final_img.paste(char_resized, (dx, dy))
                
    return final_img

# 메인 실행 로직
ref_img = Image.open('boy_run.png')
src_full = Image.open('team_rocket_sprites.png').convert("RGB")

w, h = src_full.size

# 하단 텍스트(흰색) 영역 피하기 위해 높이 추정
# 배경색(좌상단)과 다른 색이 하단에서 발견되면 그 위까지만 씀
bg_sample = src_full.getpixel((0, 0))
valid_h = h
for y in range(h - 1, 0, -1):
    if src_full.getpixel((0, y)) == bg_sample:
        valid_h = y + 1
        break

# 이미지 분할
male_src = src_full.crop((0, 0, w // 2, valid_h))
female_src = src_full.crop((w // 2, 0, w, valid_h))

# 처리
male_final = process_final(male_src, ref_img, (0, 0), "male")
female_final = process_final(female_src, ref_img, (female_src.width - 1, 0), "female")

male_final.save("rocket_male_fixed_final.png")
female_final.save("rocket_female_fixed_final.png")