import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from 'lucide-react';

interface TestSeries {
  id: number;
  title: string;
}

interface TestSeriesCardProps {
  series: TestSeries;
}

const TestSeriesCard: React.FC<TestSeriesCardProps> = ({ series }) => {
  return (
    <Link href={`/test-series/${series.id}?title=${encodeURIComponent(series.title)}`}>
      <Card className="h-24 shadow-md transition-all duration-200 border-0 hover:shadow-lg hover:scale-105 hover:bg-gray-50">
        <CardContent className="flex items-center h-full p-4">
          <div className="flex items-center w-full">
            <ClipboardList className="w-8 h-8 text-[#1C7C54] mr-4 flex-shrink-0 transition-colors duration-200 group-hover:text-[#041E3A]" />
            <div className="flex-grow">
              <h3 className="font-semibold text-[#041E3A] text-left line-clamp-2 transition-colors duration-200 group-hover:text-[#1C7C54]">{series.title}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TestSeriesCard;

