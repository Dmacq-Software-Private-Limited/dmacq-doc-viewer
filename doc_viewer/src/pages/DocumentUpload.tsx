import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, FolderOpen, AlertCircle, Type as FontIcon } from 'lucide-react'; // Import a font icon
import { apiService, UploadedDocument } from '../services/apiService.ts';

const DocumentUpload = () => {
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    for (const file of Array.from(files)) {
      try {
        const uploadedDoc = await apiService.uploadDocument(file);
        setUploadedDocuments(prev => [...prev, uploadedDoc]);
      } catch (error) {
        console.error('Upload error:', error);
        setUploadError(error instanceof Error ? error.message : 'Upload failed');
      }
    }

    setIsUploading(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const openDocument = (documentId: string) => {
    navigate(`/document/${documentId}`);
  };

  const handleButtonClick = () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('font/')) {
        return <FontIcon className="w-5 h-5 text-purple-600" />;
    }
    if (fileType.startsWith('text/') || fileType.startsWith('application/')) {
        return <FileText className="w-5 h-5 text-blue-600" />;
    }
    return <FileText className="w-5 h-5 text-red-600" />;
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Viewer</h1>
              <p className="text-gray-600">Upload and view documents with metadata extraction</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
          <CardContent className="p-8">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`text-center transition-colors rounded-lg p-8 ${
                isDragging ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-100'
              }`}
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  ) : (
                    <Upload className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {isUploading ? 'Uploading Documents...' : 'Upload Documents'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your files here, or click to browse
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                  accept=".obj,.glb,.gltf,.stl,.pak,.wad,.sav,.mdx,.rom,.doc,.docx,.odt,.sxw,.fodt,.rtf,.txt,.md,.tex,.pdf,.abw,.msg,.eml,.xls,.xlsx,.ods,.fods,.csv,.ppt,.pptx,.pps,.ppsx,.odp,.fodp,.sxi,.jpg,.jpeg,.jpe,.jfif,.jps,.png,.bmp,.gif,.webp,.tif,.tiff,.heif,.heic,.avif,.ico,.dds,.svg,.ai,.eps,.cdr,.psd,.sketch,.xcf,.mp3,.wav,.m4a,.flac,.aac,.ogg,.mp4,.avi,.mov,.mkv,.webm,.otf,.ttf,.woff,.woff2,.eot,.lit,.azw,.azw3,.fb2,.cbr,.cbz,.mdb,.accdb,.sqlite,.db,.dbf,.ndf,.ldf,.indd, .idml, .qxd, .sla, .pub, .xsd, .yaml, .yml, .toml, .ini, .cfg, .conf, .log, .bak, .tmp,.cur,.dng,.raw,.exr,.hdr,.pam,.pbm,.pcd,.pcx,.pgm,.pict,.pnm,.ppm,.psd,.ras,.sgi,.tga,.xbm,.xpm,.xwd,.html,.xhtml,.xht,.mhtml,.css,.js,.php,.xml,.json,.ts,.tsx,.c,.cpp,.java,.py,.rb,.go,.cs,.swift,.vb,.pl,.r,.jl,.kt,.dart,.h,.hpp,.outlook, .mht, .pes, .pfm, .picon, .mpp"

                  disabled={isUploading}
                />
                <Button 
                  onClick={handleButtonClick} 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isUploading}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Select Files
                </Button>
                <p className="text-sm text-gray-500">
                  Maximum file size: 50MB per file • Supported: Spreadsheets (XLS, XLSX, ODS, CSV), Presentations (PPT, PPTX, ODP), Images (JPG, PNG, SVG, etc.), Documents (DOC, DOCX, PDF, TXT, MD)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {uploadError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Upload Error:</span>
                <span>{uploadError}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {uploadedDocuments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <span>Uploaded Documents ({uploadedDocuments.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {uploadedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => openDocument(doc.id)}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        {getFileIcon(doc.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{doc.name}</h4>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(doc.size)} • {doc.totalPages} page{doc.totalPages !== 1 ? 's' : ''} • Uploaded {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300">
                      View File
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {uploadedDocuments.length === 0 && !isUploading && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded yet</h3>
              <p className="text-gray-500">Upload your first document to get started with metadata extraction and viewing</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;
