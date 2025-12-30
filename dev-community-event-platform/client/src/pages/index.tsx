import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Calendar, Users, Video, Globe, Zap, Shield } from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>开发者社区活动管理平台</title>
        <meta name="description" content="专为技术社区设计的全流程活动管理平台，集成直播、AI处理、多语言支持" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-gray-900">
                    DevCommunity Platform
                  </h1>
                </div>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="#features" className="text-gray-500 hover:text-gray-900 transition-colors">
                  功能特性
                </a>
                <a href="#about" className="text-gray-500 hover:text-gray-900 transition-colors">
                  关于我们
                </a>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  开始使用
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                开发者社区活动
                <span className="text-blue-600">管理平台</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                集成直播、AI语音转文字、智能内容总结、多语言翻译的全流程技术活动管理解决方案
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
                  立即体验
                </button>
                <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors">
                  了解更多
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                核心功能特性
              </h2>
              <p className="text-xl text-gray-600">
                为技术社区量身定制的专业活动管理工具
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* 活动管理 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  活动管理
                </h3>
                <p className="text-gray-600">
                  完整的活动生命周期管理，从发布、报名到签到，一站式解决方案
                </p>
              </div>

              {/* 实时直播 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  实时直播
                </h3>
                <p className="text-gray-600">
                  高质量WebRTC直播，支持多路摄像头切换和屏幕共享
                </p>
              </div>

              {/* AI处理 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  AI智能处理
                </h3>
                <p className="text-gray-600">
                  语音转文字、内容总结、思维导图生成，让知识沉淀更高效
                </p>
              </div>

              {/* 多语言支持 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  多语言支持
                </h3>
                <p className="text-gray-600">
                  中英文双语界面，实时翻译功能，服务国际化技术社区
                </p>
              </div>

              {/* 内容归档 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  内容归档
                </h3>
                <p className="text-gray-600">
                  智能内容归档和搜索，构建社区知识库，让优质内容持续发挥价值
                </p>
              </div>

              {/* 安全可靠 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  安全可靠
                </h3>
                <p className="text-gray-600">
                  企业级安全保障，数据加密传输，完善的备份和恢复机制
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              准备开始了吗？
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              加入我们，让技术活动管理变得更简单、更高效
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
              免费试用
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">DevCommunity Platform</h3>
              <p className="text-gray-400 mb-4">
                专为开发者社区设计的活动管理平台
              </p>
              <p className="text-gray-500 text-sm">
                © 2024 DevCommunity Platform. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}