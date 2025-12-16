'use client';

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { TiptapViewer } from './TiptapViewer';

interface MobileBookPreviewProps {
  content: {
    title: string;
    htmlContent: string;
    coverImageUrl?: string;
  };
}

export function MobileBookPreview({ content }: MobileBookPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);

  // Split content by page breaks or fallback to paragraph grouping
  const getPages = () => {
    if (content.htmlContent.includes('data-page-break="true"')) {
      const pageBreakSplit = content.htmlContent.split(/<div[^>]*data-page-break="true"[^>]*>.*?<\/div>/gi);
      return pageBreakSplit.filter(page => page.trim());
    }

    // Fallback: split by h2 tags or group paragraphs
    const h2Split = content.htmlContent.split(/<h2[^>]*>/gi);
    if (h2Split.length > 1) {
      const pages = [];
      for (let i = 0; i < h2Split.length; i++) {
        if (i === 0 && h2Split[i].trim()) {
          pages.push(h2Split[i]);
        } else if (i > 0) {
          pages.push(`<h2>${h2Split[i]}`);
        }
      }
      return pages.filter(page => page.trim());
    }

    // Final fallback: group paragraphs
    const paragraphs = content.htmlContent.split('</p>').filter(p => p.trim());
    const pages = [];
    for (let i = 0; i < paragraphs.length; i += 3) {
      const pageParagraphs = paragraphs.slice(i, i + 3);
      pages.push(pageParagraphs.join('</p>') + '</p>');
    }
    return pages.length ? pages : [content.htmlContent];
  };

  const pages = getPages();

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-black mb-4">Content Preview</h2>
      
      <div className="border border-gray-200 rounded-lg p-6 bg-white min-h-96">
        <TiptapViewer 
          key={currentPage}
          content={pages[currentPage]?.replace(/<div[^>]*data-page-break[^>]*>.*?<\/div>/gi, '') || ''}
          className="prose prose-lg max-w-none text-gray-900"
        />
      </div>

      {/* Navigation Controls */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          ← Previous
        </button>
        
        <div className="flex-1 text-center px-8">
          <div className="text-sm text-gray-600 mb-2">
            Page {currentPage + 1} of {pages.length}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
            />
          </div>
        </div>
        
        <button
          onClick={nextPage}
          disabled={currentPage === pages.length - 1}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {currentPage === pages.length - 1 ? 'Finish 🎉' : 'Next →'}
        </button>
      </div>
    </div>
  );
}