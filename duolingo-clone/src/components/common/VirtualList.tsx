import React, { useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useVirtualScroll, useElementSize } from '../../hooks/usePerformance';

const Container = styled.div`
  height: 100%;
  overflow: auto;
  position: relative;
`;

const Content = styled.div<{ height: number }>`
  height: ${props => props.height}px;
  position: relative;
`;

const ItemContainer = styled.div<{ offset: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  transform: translateY(${props => props.offset}px);
`;

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
}

export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  className,
  overscan = 5,
  onScroll,
}: VirtualListProps<T>) {
  const [containerRef, containerSize] = useElementSize<HTMLDivElement>();

  const {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
  } = useVirtualScroll({
    items,
    itemHeight,
    containerHeight: containerSize.height,
    overscan,
  });

  const handleScrollWithCallback = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      handleScroll(event);
      onScroll?.(event.currentTarget.scrollTop);
    },
    [handleScroll, onScroll]
  );

  const renderedItems = useMemo(() => {
    return visibleItems.map((item, index) => (
      <div
        key={startIndex + index}
        style={{
          height: itemHeight,
          position: 'relative',
        }}
      >
        {renderItem(item, startIndex + index)}
      </div>
    ));
  }, [visibleItems, startIndex, itemHeight, renderItem]);

  return (
    <Container
      ref={containerRef}
      className={className}
      onScroll={handleScrollWithCallback}
    >
      <Content height={totalHeight}>
        <ItemContainer offset={offsetY}>
          {renderedItems}
        </ItemContainer>
      </Content>
    </Container>
  );
}

export default VirtualList;