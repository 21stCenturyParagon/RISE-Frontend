import React from 'react';
import Link from 'next/link';

import { ClipboardList } from 'lucide-react';
import {Card, CardContent} from "@/components/ui/card";

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
      <Card className="h-24 hover:shadow-md transition-shadow duration-200">
        <CardContent className="flex items-center h-full p-4">
          <div className="flex items-center w-full">
            <ClipboardList className="w-8 h-8 text-[#1C7C54] mr-4 flex-shrink-0" />
            <div className="flex-grow">
              <h3 className="font-semibold text-[#041E3A] text-left line-clamp-2">{series.title}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TestSeriesCard;

