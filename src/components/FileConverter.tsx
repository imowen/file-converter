import React, { useState, useEffect } from 'react';
import { Upload, FileJson, FileSpreadsheet, FileCode } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface CSVData {
  [key: string]: string | number | null;
}

enum FileStatus {
  Idle = '',
  Uploading = '文件上传中...',
  Parsing = '正在解析文件...',
  Success = '解析成功',
  Error = '解析失败：请上传有效的 CSV 文件',
}

const FileConverter: React.FC = () => {
  const [data, setData] = useState<CSVData[]>([]);
  const [status, setStatus] = useState<FileStatus>(FileStatus.Idle);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // 通用文件处理逻辑
  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setStatus(FileStatus.Error);
      return;
    }

    setStatus(FileStatus.Parsing);
    Papa.parse<CSVData>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length) {
          setData(results.data);
          setStatus(FileStatus.Success);
        } else {
          setStatus('解析失败：CSV 文件为空' as FileStatus);
        }
      },
      error: () => {
        setStatus(FileStatus.Error);
      },
    });
  };

  // 文件上传处理
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  // 拖放处理
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  // 文件下载
  const downloadFile = (dataString: string, type: string, filename: string) => {
    const blob = new Blob([dataString], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    if (!data.length) return;
    const jsonString = JSON.stringify(data, null, 2);
    downloadFile(jsonString, 'application/json', 'converted.json');
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
    downloadFile(xml, 'application/xml', 'converted.xml');
  };

  // 分页数据
  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // 页码重置
  useEffect(() => {
    if (currentPage > Math.ceil(data.length / pageSize)) {
      setCurrentPage(1);
    }
  }, [data, currentPage, pageSize]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">CSV文件格式转换工具</h1>
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
        <label htmlFor="fileInput" className="cursor-pointer">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">点击或拖放 CSV 文件到此处</p>
        </label>
      </div>

      {status && <div className="text-center mb-6 text-gray-600">{status}</div>}

      {data.length > 0 && (
        <>
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
                  {paginatedData.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((value, j) => (
                        <td key={j} className="px-4 py-2 text-sm text-gray-900">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between mt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                上一页
              </button>
              <button
                disabled={currentPage * pageSize >= data.length}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                下一页
              </button>
            </div>
            <p className="text-gray-500 text-sm mt-2">
              显示第 {currentPage} 页，共 {Math.ceil(data.length / pageSize)} 页
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default FileConverter;
