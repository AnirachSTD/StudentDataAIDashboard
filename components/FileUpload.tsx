import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Student } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';

interface FileUploadProps {
  onFileUpload: (data: Student[], fileName: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback((file: File | null) => {
    if (!file) return;

    const validExtensions = ['.xlsx', '.xls'];
    if (!validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
        setError('Invalid file type. Please upload an Excel file (.xlsx, .xls).');
        return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          let allStudents: Student[] = [];
          
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

            if (jsonData.length < 2) return;

            const headers = jsonData[0].map(h => String(h).trim());
            const headerMap: { [key in keyof Omit<Student, 'academicYear' | 'curriculum'>]?: number } = {
                studentId: headers.indexOf('รหัสนักศึกษา'),
                title: headers.indexOf('คำนำหน้า'),
                firstName: headers.indexOf('ชื่อ'),
                lastName: headers.indexOf('นามสกุล'),
                status: headers.indexOf('สถานะ'),
                year: headers.indexOf('ชั้นปี'),
                gpax: headers.indexOf('GPAX'),
                program: headers.indexOf('หลักสูตร'),
                room: headers.indexOf('ห้อง'),
            };

            const program2Index = headers.indexOf('หลักสูตร2');
            const curriculumIndex = headers.indexOf('หลักสูตร3');

            if (headerMap.studentId === -1 || headerMap.status === -1 || headerMap.gpax === -1) {
                console.log(`Skipping sheet "${sheetName}" due to missing required headers.`);
                return;
            }

            const sheetStudents = jsonData.slice(1).map(row => {
                const programText = headerMap.program !== -1 ? row[headerMap.program!] : '';
                const program2Text = program2Index !== -1 ? row[program2Index] : '';
                const curriculumText = curriculumIndex !== -1 ? row[curriculumIndex] : 'N/A';

                return {
                    studentId: String(row[headerMap.studentId!] || ''),
                    title: String(row[headerMap.title!] || ''),
                    firstName: String(row[headerMap.firstName!] || ''),
                    lastName: String(row[headerMap.lastName!] || ''),
                    status: String(row[headerMap.status!] || 'Unknown'),
                    year: Number(row[headerMap.year!]) || 0,
                    gpax: Number(row[headerMap.gpax!]) || 0,
                    program: `${programText} ${program2Text}`.trim(),
                    room: String(row[headerMap.room!] || ''),
                    curriculum: String(curriculumText),
                    academicYear: sheetName,
                };
            }).filter(s => s.studentId);

            allStudents = allStudents.concat(sheetStudents);
          });
          
          if (allStudents.length === 0) {
            throw new Error("No valid student data found in the Excel file. Please check headers and content.");
          }

          onFileUpload(allStudents, file.name);

        } catch (parseError: any) {
          console.error("Error parsing file:", parseError);
          setError(parseError.message || 'Failed to process the Excel file. Ensure it is a valid format.');
        } finally {
            setIsProcessing(false);
        }
      };

      reader.onerror = () => {
        setError('Failed to read the file.');
        setIsProcessing(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      console.error("Error with FileReader:", err);
      setError('An unexpected error occurred.');
      setIsProcessing(false);
    }
  }, [onFileUpload]);
  
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    processFile(file);
    event.target.value = '';
  }, [processFile]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isProcessing) setIsDragging(true);
  }, [isProcessing]);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (isProcessing) return;
    const file = event.dataTransfer.files?.[0] || null;
    processFile(file);
  }, [processFile, isProcessing]);

  return (
    <div className="flex items-center justify-center h-[60vh]">
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Upload Student Data</CardTitle>
                <CardDescription>Select an Excel file (.xlsx, .xls) to get started.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center space-y-4">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer w-full"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                    <div className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg transition-colors ${isDragging ? 'bg-gray-100 dark:bg-gray-800 border-primary dark:border-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadIcon className="w-10 h-10 mb-3 text-gray-400 dark:text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-200">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-200">XLSX, XLS files</p>
                        </div>
                    </div>
                    <input
                        id="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        disabled={isProcessing}
                    />
                    </label>

                    {isProcessing && <p className="text-sm text-gray-600 dark:text-gray-300">Processing file...</p>}
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
            </CardContent>
        </Card>
    </div>
  );
};

export default FileUpload;