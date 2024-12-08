import React, { createContext, useContext, useState, ReactNode } from 'react';

interface QuestionContextType {
  selectedAnswer: string;
  setSelectedAnswer: (answer: string) => void;
}

const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

export const QuestionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');

  return (
    <QuestionContext.Provider value={{ selectedAnswer, setSelectedAnswer }}>
      {children}
    </QuestionContext.Provider>
  );
};

export const useQuestionContext = () => {
  const context = useContext(QuestionContext);
  if (context === undefined) {
    throw new Error('useQuestionContext must be used within a QuestionProvider');
  }
  return context;
};

