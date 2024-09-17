import { Link } from 'gatsby';
import React, { useState, useEffect } from 'react';
import './style.scss';

function PostCard({ post }) {
  const { id, slug, title, excerpt, date, categories } = post;

  // SCSS 로딩 상태 관리
  const [stylesLoaded, setStylesLoaded] = useState(false);

  useEffect(() => {
    const stylesheet = document.querySelector('link[href*="commons.css"]'); // 컴파일된 CSS 파일을 찾아봄

    if (stylesheet) {
      // 스타일 시트가 이미 로드된 경우
      if (stylesheet.sheet) {
        setStylesLoaded(true);
      } else {
        // 스타일 시트 로딩 이벤트를 기다림
        stylesheet.addEventListener('load', () => {
          setStylesLoaded(true);
        });
      }
    }
  }, []);

  // SCSS가 로드되지 않았다면 로딩 표시
  if (!stylesLoaded) {
    return <></>;
  }

  // SCSS가 로드되면 PostCard 컴포넌트 렌더링
  return (
    <div className="post-card-wrapper">
      <Link className="post-card" key={id} to={slug}>
        <div className="title">{title}</div>
        <p className="description" dangerouslySetInnerHTML={{ __html: excerpt }} />
        <div className="info">
          <div className="date">{date}</div>
          <div className="categories">
            {categories.map((category) => (
              <Link className="category" key={category} to={`/posts/${category}`}>
                {category}
              </Link>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default PostCard;