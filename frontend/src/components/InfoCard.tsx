import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface InfoCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, description, icon }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start space-x-4 pb-2">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default InfoCard; 