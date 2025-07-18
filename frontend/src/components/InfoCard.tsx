import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface InfoCardProps {
  title: string;
  content: string;
  icon: 'explanation' | 'visualization';
}

const InfoCard: React.FC<InfoCardProps> = ({ title, content, icon }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-x-2 pb-2">
        {icon === 'explanation' ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
          </svg>
        )}
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-line">{content}</p>
      </CardContent>
    </Card>
  );
};

export default InfoCard; 