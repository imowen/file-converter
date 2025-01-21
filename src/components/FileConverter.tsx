import React, { useState } from 'react';
import { Upload, FileJson, FileSpreadsheet, FileCode } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// 定义 CSV 数据的类型
interface CSVData {
  [key: string]: string | number | null;
}

const FileConverter: React.FC = () => {
  const [data, setData] = useState<CSVData[]>([]); // 存储解析后的数据
  const [status, setStatus] = useState<string>(''); // 状态提示

  // 文件上传处理
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        parseCSV(file);
      } else {
        setStatus('请上传有效的 CSV 文件');
      }
    }
  };

  // 解析 CSV 文件
  const parseCSV = (file: File) => {
    Papa.parse<CSVData>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
        setStatus(`成功解析 ${results.data.length} 条记录`);
      },
      error: (error) => {
        setStatus(`解析出错：${error.message}`);
      },
    });
  };

  // 下载 JSON 文件
  const downloadJSON = () => {
    if (!data.length) return;
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 下载 Excel 文件
  const downloadExcel = () => {
    if (!data.length) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'converted.xlsx');
  };

  // 下载 XML 文件
  const downloadXML = () => {
    if (!data.length) return;
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
    data.forEach((row, index) => {
      xml += `  <record id="${index + 1}">\n`;
      Object.entries(row).forEach(([key, value]) => {
        xml += `    <${key}>${value ?? ''}</${key}>\n`;
      });
      xml += '  </record>\n';
    });
    xml += '</root>';
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">CSV 文件转换工具</h1>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
          id="fileInput"
        />
        <label htmlFor="fileInput" className="cursor-pointer">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">点击或拖放 CSV 文件到此处</p>
        </label>
      </div>
      <div className={`text-center mb-6 ${data.length ? 'text-green-600' : 'text-red-600'}`}>
        {status}
      </div>
      {data.length > 0 && (
        <div className="flex justify-center gap-4">
          <button onClick={downloadJSON} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
            <FileJson className="h-5 w-5" />
            下载 JSON
          </button>
          <button onClick={downloadExcel} className="px-4 py-2 bg-green-500 text-white rounded-lg">
            <FileSpreadsheet className="h-5 w-5" />
            下载 Excel
          </button>
          <button onClick={downloadXML} className="px-4 py-2 bg-purple-500 text-white rounded-lg">
            <FileCode className="h-5 w-5" />
            下载 XML
          </button>
        </div>
      )}
    </div>
  );
};

export default FileConverter;
