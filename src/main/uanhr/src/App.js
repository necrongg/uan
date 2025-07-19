import React, { useState, useMemo, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [images, setImages] = useState([
    'https://picsum.photos/seed/a/200',
    'https://picsum.photos/seed/b/210',
    'https://picsum.photos/seed/c/190',
    'https://picsum.photos/seed/d/180',
    'https://picsum.photos/seed/c/190',
    'https://picsum.photos/seed/d/180',
    'https://picsum.photos/seed/c/190',
    'https://picsum.photos/seed/d/180',
    'https://picsum.photos/seed/c/190',
    'https://picsum.photos/seed/d/180',
    'https://picsum.photos/seed/c/190',
    'https://picsum.photos/seed/d/180',
    'https://picsum.photos/seed/d/180',
    'https://picsum.photos/seed/c/190',
    'https://picsum.photos/seed/d/180',
    'https://picsum.photos/seed/c/190',
    'https://picsum.photos/seed/d/180',
    'https://picsum.photos/seed/d/180',
    'https://picsum.photos/seed/c/190',
    'https://picsum.photos/seed/d/180',
    'https://picsum.photos/seed/c/190',
    'https://picsum.photos/seed/d/180',
    'https://picsum.photos/seed/d/180',
    'https://picsum.photos/seed/c/190',
    'https://picsum.photos/seed/d/180',
    'https://picsum.photos/seed/c/190',
    'https://picsum.photos/seed/d/180',
    'https://picsum.photos/seed/c/190',
    'https://picsum.photos/seed/d/180',
    'https://picsum.photos/seed/e/220',
    // ... 기타 이미지들
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const inputRef = useRef();

  // 그리드 설정 (가장자리도 사용)
  const ROWS_PER_PAGE = 5;
  const COLS_PER_PAGE = 15;
  const IMAGES_PER_PAGE = ROWS_PER_PAGE * COLS_PER_PAGE;
  const totalPages = Math.ceil(images.length / IMAGES_PER_PAGE);

  // 모든 페이지의 레이아웃을 미리 계산하여 저장
  const [allLayouts, setAllLayouts] = useState([]);

// 기존 코드에서 레이아웃 계산 부분만 수정합니다.
  useEffect(() => {
    const calculateAllLayouts = () => {
      const layouts = [];
      let imageId = 0;

      for (let page = 0; page < Math.ceil(images.length / IMAGES_PER_PAGE); page++) {
        const grid = Array(ROWS_PER_PAGE).fill().map(() => Array(COLS_PER_PAGE).fill(true));
        const positions = [];

        const startIdx = page * IMAGES_PER_PAGE;
        const endIdx = Math.min(startIdx + IMAGES_PER_PAGE, images.length);

        for (let i = startIdx; i < endIdx; i++) {
          let width, height;
          const rand = Math.random();

          // 더 다양한 크기 조합 (확률 조정 가능)
          if (rand < 0.5) {
            width = 1; height = 1;       // 50% 1x1
          } else if (rand < 0.7) {
            width = 2; height = 1;       // 20% 2x1
          } else if (rand < 0.8) {
            width = 1; height = 2;       // 10% 1x2
          } else if (rand < 0.9) {
            width = 2; height = 2;       // 10% 2x2
          } else if (rand < 0.95) {
            width = 3; height = 1;       // 5% 3x1
          } else if (rand < 0.97) {
            width = 1; height = 3;       // 2% 1x3
          } else {
            width = 3; height = 3;       // 3% 3x3 (최대 크기)
          }

          // 그리드 경계 확인 (크기 조정)
          width = Math.min(width, COLS_PER_PAGE);
          height = Math.min(height, ROWS_PER_PAGE);

          let placed = false;

          // 사용 가능한 위치 찾기 (랜덤한 순서로 시도)
          const rows = Array.from({length: ROWS_PER_PAGE - height + 1}, (_, i) => i);
          const cols = Array.from({length: COLS_PER_PAGE - width + 1}, (_, i) => i);

          shuffleArray(rows);
          shuffleArray(cols);

          rowLoop:
              for (const row of rows) {
                for (const col of cols) {
                  let canPlace = true;

                  // 해당 영역이 모두 비어있는지 확인
                  for (let r = row; r < row + height; r++) {
                    for (let c = col; c < col + width; c++) {
                      if (!grid[r][c]) {
                        canPlace = false;
                        break;
                      }
                    }
                    if (!canPlace) break;
                  }

                  if (canPlace) {
                    // 해당 영역을 차지함으로 표시
                    for (let r = row; r < row + height; r++) {
                      for (let c = col; c < col + width; c++) {
                        grid[r][c] = false;
                      }
                    }

                    positions.push({
                      id: imageId++,
                      rowStart: row + 1,
                      colStart: col + 1,
                      width,
                      height
                    });
                    placed = true;
                    break rowLoop;
                  }
                }
              }

          if (!placed) {
            // 원하는 크기로 배치 실패 시 점점 작은 크기로 시도
            const sizeOptions = [
              {w:2, h:2}, {w:3, h:1}, {w:1, h:3},
              {w:2, h:1}, {w:1, h:2}, {w:1, h:1}
            ];

            for (const size of sizeOptions) {
              const tryWidth = Math.min(size.w, COLS_PER_PAGE);
              const tryHeight = Math.min(size.h, ROWS_PER_PAGE);

              for (let row = 0; row < ROWS_PER_PAGE - tryHeight + 1; row++) {
                for (let col = 0; col < COLS_PER_PAGE - tryWidth + 1; col++) {
                  let canPlace = true;

                  for (let r = row; r < row + tryHeight; r++) {
                    for (let c = col; c < col + tryWidth; c++) {
                      if (!grid[r][c]) {
                        canPlace = false;
                        break;
                      }
                    }
                    if (!canPlace) break;
                  }

                  if (canPlace) {
                    for (let r = row; r < row + tryHeight; r++) {
                      for (let c = col; c < col + tryWidth; c++) {
                        grid[r][c] = false;
                      }
                    }

                    positions.push({
                      id: imageId++,
                      rowStart: row + 1,
                      colStart: col + 1,
                      width: tryWidth,
                      height: tryHeight
                    });
                    placed = true;
                    break;
                  }
                }
                if (placed) break;
              }
              if (placed) break;
            }
          }
        }

        layouts.push(positions);
      }

      setAllLayouts(layouts);
    };

    calculateAllLayouts();
  }, [images]);

  // 배열 섞기 함수
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // 현재 페이지의 이미지와 레이아웃
  const currentImages = images.slice(
      pageIndex * IMAGES_PER_PAGE,
      (pageIndex + 1) * IMAGES_PER_PAGE
  );
  const currentLayout = allLayouts[pageIndex] || [];

  // 이미지 추가
  const addImage = (url) => {
    if (!url) return;
    setImages((prev) => [...prev, url]);
    inputRef.current.value = '';
  };

  // 모달 열기
  const openModal = (index) => {
    setCurrentIndex(pageIndex * IMAGES_PER_PAGE + index);
    setModalOpen(true);
  };

  // 모달 닫기 및 네비게이션
  const closeModal = () => setModalOpen(false);
  const prevModal = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  const nextModal = () => setCurrentIndex((prev) => (prev + 1) % images.length);

  // 페이지 네비게이션
  const prevPage = () => {
    setPageIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const nextPage = () => {
    setPageIndex((prev) => (prev + 1) % totalPages);
  };

  return (
      <div className="app">
        <img src="/images/bg.jpeg" className="bg" alt="bg" />

        <h1>유안 갤러리</h1>

        <div className="upload-form">
          <input ref={inputRef} type="text" placeholder="이미지 URL 입력" />
          <button onClick={() => addImage(inputRef.current.value)}>업로드</button>
        </div>

        <div
            className="grid-gallery"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${COLS_PER_PAGE}, 1fr)`,
              gridTemplateRows: `repeat(${ROWS_PER_PAGE}, 100px)`,
              gap: '5px',
              width: `${COLS_PER_PAGE * 100}px`,
              height: `${ROWS_PER_PAGE * 100}px`,
              margin: '20px auto',
            }}
        >
          {currentLayout.map((pos, i) => {
            const imageUrl = currentImages[i];
            if (!imageUrl) return null;

            return (
                <div
                    key={`${pageIndex}-${pos.id}`}
                    style={{
                      gridColumn: `${pos.colStart} / span ${pos.width}`,
                      gridRow: `${pos.rowStart} / span ${pos.height}`,
                      backgroundImage: `url(${imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '2px solid rgba(255,255,255,0.5)',
                      boxSizing: 'border-box',
                    }}
                    onClick={() => openModal(i)}
                />
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <button onClick={prevPage} disabled={totalPages <= 1}>
            ◀ 이전
          </button>
          <span style={{ margin: '0 10px' }}>
          {pageIndex + 1} / {totalPages}
        </span>
          <button onClick={nextPage} disabled={totalPages <= 1}>
            다음 ▶
          </button>
        </div>

        {modalOpen && (
            <div className="modal" onClick={closeModal}>
          <span className="close" onClick={closeModal}>
            &times;
          </span>
              <span
                  className="modal-nav prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevModal();
                  }}
              >
            &#10094;
          </span>
              <span
                  className="modal-nav next"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextModal();
                  }}
              >
            &#10095;
          </span>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <img src={images[currentIndex]} alt="확대" />
              </div>
            </div>
        )}
      </div>
  );
}

export default App;