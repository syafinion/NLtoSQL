import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

interface SchemaSelectorProps {
  schemas: string[];
  selectedSchema: string;
  setSelectedSchema: (schema: string) => void;
  schemaDefinition: string;
}

const SchemaSelector: React.FC<SchemaSelectorProps> = ({
  schemas,
  selectedSchema,
  setSelectedSchema,
  schemaDefinition,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Database Schema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={selectedSchema} onValueChange={setSelectedSchema}>
          <TabsList className="w-full">
            {schemas.map((schema) => (
              <TabsTrigger 
                key={schema} 
                value={schema}
                className="flex-1"
              >
                {schema}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Schema Definition</h3>
          <div className="bg-muted rounded-md p-3 overflow-auto max-h-[500px]">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {schemaDefinition}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchemaSelector; 