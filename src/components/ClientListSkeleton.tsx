import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const ROW_HEIGHT = 200;

export function ClientListSkeleton() {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style} className="p-4">
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="mt-4">
          <div className="h-2 bg-gray-200 rounded w-full"></div>
          <div className="mt-2 h-2 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-200px)]">
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            height={height}
            width={width}
            itemCount={10}
            itemSize={ROW_HEIGHT}
          >
            {Row}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  );
} 