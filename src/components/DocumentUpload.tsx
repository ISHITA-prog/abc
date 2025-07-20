
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Download, Trash2, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  status: string;
}

const DocumentUpload = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      name: 'Company Registration Certificate.pdf',
      type: 'Registration',
      size: '2.4 MB',
      uploadDate: '2024-01-15',
      status: 'Verified'
    },
    {
      id: 2,
      name: 'GST Certificate.pdf',
      type: 'Tax Document',
      size: '1.8 MB',
      uploadDate: '2024-01-15',
      status: 'Pending'
    },
    {
      id: 3,
      name: 'PAN Card.pdf',
      type: 'Identity',
      size: '0.9 MB',
      uploadDate: '2024-01-15',
      status: 'Verified'
    }
  ]);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const documentTypes = [
    'Company Registration Certificate',
    'GST Certificate',
    'PAN Card',
    'Bank Details',
    'Previous Work Experience',
    'Technical Certificates',
    'ISO Certifications',
    'Financial Statements',
    'Other Supporting Documents'
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) { // 10MB per file
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive"
        });
        continue;
      }

      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            
            // Add to documents list
            const newDoc: Document = {
              id: Date.now() + Math.random(),
              name: file.name,
              type: 'New Document',
              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              uploadDate: new Date().toISOString().split('T')[0],
              status: 'Pending'
            };
            
            setDocuments(prev => [...prev, newDoc]);
            
            toast({
              title: "File Uploaded",
              description: `${file.name} uploaded successfully`
            });
            
            return 0;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const handleDownload = (doc: Document) => {
    toast({
      title: "Download Started",
      description: `Downloading ${doc.name}`
    });
  };

  const handleDelete = (docId: number) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    toast({
      title: "Document Deleted",
      description: "Document has been removed from your profile"
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'Verified': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-6 h-6 mr-2" />
            Document Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>Document Requirements:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Maximum file size: 10MB per document</li>
                  <li>• Preferred format: PDF</li>
                  <li>• Accepted formats: PDF, DOC, DOCX, JPG, PNG</li>
                  <li>• All documents must be clearly readable</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload Supporting Documents
                  </h3>
                  <p className="text-sm text-gray-600">
                    Drag and drop files here, or click to browse
                  </p>
                </div>
                
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button type="button" asChild>
                    <span className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Types Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Required Document Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {documentTypes.map((type, index) => (
              <div
                key={index}
                className="p-3 border rounded-lg text-sm bg-gray-50"
              >
                {type}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <FileText className="w-6 h-6 mr-2" />
              My Documents ({documents.length})
            </span>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No documents uploaded yet
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{doc.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{doc.type}</span>
                        <span>{doc.size}</span>
                        <span>Uploaded: {doc.uploadDate}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(doc.status)}`}>
                      {doc.status}
                    </span>
                    
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentUpload;
