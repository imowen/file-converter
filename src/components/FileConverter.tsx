import React, { useState } from 'react';
import { Upload, FileText, FileJson, FileSpreadsheet, FileCode } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const FileConverter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [status, setStatus] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setFile(file);
      parseCSV(file);
    } else {
      setStatus('请上传 CSV 文件');
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
        setStatus(`成功解析 ${results.data.length} 条记录`);
      },
      error: (error) => {
        setStatus('解析出错：' + error.message);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      setFile(file);
      parseCSV(file);
    } else {
      setStatus('请上传 CSV 文件');
    }
  };

  const downloadJSON = () => {
    if (!data.length) return;
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadExcel = () => {
    if (!data.length) return;
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'converted.xlsx');
  };

  const downloadXML = () => {
    if (!data.length) return;
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
    data.forEach((row, index) => {
      xml += `  <record id="${index + 1}">\n`;
      Object.entries(row).forEach(([key, value]) => {
        xml += `    <${key}>${value}</${key}>\n`;
      });
      xml += '  </record>\n';
    });
    xml += '</root>';
    
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">CSV文件格式转换JSON、Excel、XML格式工具</h1>
      <p className="text-gray-600 text-center mb-8">支持 CSV 转换为 JSON、Excel、XML 格式</p>
      {/* 上传区域 */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer"
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">
            点击或拖放 CSV 文件到此处
          </p>
        </label>
      </div>

      {/* 状态显示 */}
      {status && (
        <div className="text-center mb-6 text-gray-600">
          {status}
        </div>
      )}

      {/* 转换按钮 */}
      {data.length > 0 && (
        <div className="flex justify-center gap-4">
          <button
            onClick={downloadJSON}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <FileJson className="h-5 w-5" />
            下载 JSON
          </button>
          <button
            onClick={downloadExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <FileSpreadsheet className="h-5 w-5" />
            下载 Excel
          </button>
          <button
            onClick={downloadXML}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            <FileCode className="h-5 w-5" />
            下载 XML
          </button>
        </div>
      )}

      {/* 数据预览 */}
      {data.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">数据预览</h2>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key} className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((value: any, j) => (
                      <td key={j} className="px-4 py-2 text-sm text-gray-900">
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            显示前 5 条记录（共 {data.length} 条）
          </p>
        </div>
      )}
    </div>
  );
};

export default FileConverter;