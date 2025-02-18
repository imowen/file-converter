import type { NextPage } from 'next';
import Head from 'next/head';
import FileConverter from '../components/FileConverter';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        {/* 基础 SEO 标签 */}
        <title>CSV文件转换工具 - 支持JSON/Excel/XML格式转换</title>
        <meta name="description" content="免费在线CSV转换工具，轻松将CSV文件转换为JSON、Excel、XML格式。支持文件拖拽上传，实时预览，快速下载。" />
        <meta name="keywords" content="CSV转换器,JSON转换,Excel转换,XML转换,文件格式转换,在线工具" />
        
        {/* Open Graph 标签 */}
        <meta property="og:title" content="CSV文件转换工具 - 支持JSON/Excel/XML格式转换" />
        <meta property="og:description" content="免费在线CSV转换工具，轻松将CSV文件转换为JSON、Excel、XML格式。" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CSV文件转换工具" />
        
        {/* Twitter 卡片标签 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CSV文件转换工具" />
        <meta name="twitter:description" content="免费在线CSV转换工具，支持多种格式转换" />
        
        {/* 其他有用的元标签 */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="RemitX" />
        <link rel="canonical" href="https://csvconverter.xcoff.ee" />
        <link rel="icon" href="/favicon.ico" />
        <script defer data-domain="csvconverter.xcoff.ee" src="https://view.xcoff.ee/js/script.js"></script>
      </Head>

      <main className="min-h-screen bg-gray-50 py-12">
        <FileConverter />
      </main>

      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} CSV文件转换工具 - 轻松转换各种文件格式</p>
      </footer>
    </div>
  );
};

export default Home;
