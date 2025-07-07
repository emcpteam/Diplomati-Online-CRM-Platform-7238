import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const CompanyConfig = () => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState(state.company);
  const [isEditing, setIsEditing] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadingLogo(true);
    
    try {
      // Convert to base64 for local storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target.result;
        handleInputChange('logo', logoUrl);
        setUploadingLogo(false);
        toast.success('Logo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploadingLogo(false);
      toast.error('Error uploading logo');
    }
  };

  const handleDeleteLogo = () => {
    if (window.confirm('Are you sure you want to delete the logo?')) {
      handleInputChange('logo', null);
      toast.success('Logo deleted successfully!');
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Company name is required');
      return;
    }

    dispatch({ type: 'SET_COMPANY', payload: formData });
    setIsEditing(false);
    toast.success('Company configuration saved successfully!');
  };

  const handleReset = () => {
    setFormData(state.company);
    setIsEditing(false);
    toast.info('Changes discarded');
  };

  const handleExportData = () => {
    const companyData = {
      company: state.company,
      stats: {
        totalStudents: state.students.length,
        totalSchools: state.schools.length,
        totalCourses: state.courses.length,
        totalRevenue: state.students.reduce((sum, s) => sum + s.paidAmount, 0)
      },
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(companyData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'company-data-export.json';
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Company data exported successfully!');
  };

  const handleGenerateReport = () => {
    toast.loading('Generating report...', { id: 'report' });

    setTimeout(() => {
      const reportData = {
        period: new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
        students: {
          total: state.students.length,
          active: state.students.filter(s => s.status === 'active').length,
          new: state.students.filter(s => {
            const enrollmentDate = new Date(s.enrollmentDate);
            const thisMonth = new Date();
            return enrollmentDate.getMonth() === thisMonth.getMonth() && 
                   enrollmentDate.getFullYear() === thisMonth.getFullYear();
          }).length
        },
        revenue: {
          total: state.students.reduce((sum, s) => sum + s.paidAmount, 0),
          pending: state.students.reduce((sum, s) => sum + (s.totalAmount - s.paidAmount), 0)
        },
        courses: state.courses.map(course => ({
          name: course.name,
          enrollments: state.students.filter(s => s.course === course.name).length
        }))
      };

      const reportContent = `
MONTHLY REPORT - ${reportData.period}

STUDENTS:
- Total: ${reportData.students.total}
- Active: ${reportData.students.active}
- New this month: ${reportData.students.new}

REVENUE:
- Collected: €${reportData.revenue.total.toLocaleString()}
- Pending: €${reportData.revenue.pending.toLocaleString()}

TOP COURSES:
${reportData.courses.map(c => `- ${c.name}: ${c.enrollments} enrollments`).join('\n')}

Generated on: ${new Date().toLocaleDateString('it-IT')}
      `;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `monthly-report-${new Date().getMonth() + 1}-${new Date().getFullYear()}.txt`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('Monthly report generated successfully!', { id: 'report' });
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-800">
            Company Configuration
          </h1>
          <p className="text-neutral-600 mt-2">
            Configure main company information
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                icon={FiIcons.FiRefreshCw}
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button
                icon={FiIcons.FiSave}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              icon={FiIcons.FiEdit}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Company Logo */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Company Logo
        </h3>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-neutral-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-neutral-300 relative overflow-hidden">
              {formData.logo ? (
                <img
                  src={formData.logo}
                  alt="Logo"
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <SafeIcon icon={FiIcons.FiImage} className="w-8 h-8 text-neutral-400" />
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={!isEditing || uploadingLogo}
                className="hidden"
                id="logo-upload"
              />
              
              <label htmlFor="logo-upload">
                <Button
                  as="span"
                  variant="outline"
                  icon={uploadingLogo ? FiIcons.FiLoader : FiIcons.FiImage}
                  disabled={!isEditing || uploadingLogo}
                >
                  {uploadingLogo ? 'Uploading...' : formData.logo ? 'Change Logo' : 'Upload Logo'}
                </Button>
              </label>
              
              {formData.logo && isEditing && (
                <Button
                  variant="outline"
                  icon={FiIcons.FiTrash2}
                  onClick={handleDeleteLogo}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Delete
                </Button>
              )}
            </div>
            
            <p className="text-sm text-neutral-500 mt-2">
              Supported formats: JPG, PNG, SVG. Max 5MB.
            </p>
            <p className="text-sm text-neutral-400 mt-1">
              Logo will be automatically resized to fit.
            </p>
          </div>
        </div>
      </Card>

      {/* Company Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-6">
          Company Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Company Name *"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Diplomati Online Srl"
            icon={FiIcons.FiBuilding}
            readOnly={!isEditing}
          />
          <Input
            label="VAT Number"
            value={formData.vatId}
            onChange={(e) => handleInputChange('vatId', e.target.value)}
            placeholder="IT12345678901"
            icon={FiIcons.FiHash}
            readOnly={!isEditing}
          />
          <Input
            label="SDI Code"
            value={formData.sdiCode}
            onChange={(e) => handleInputChange('sdiCode', e.target.value)}
            placeholder="ABCDEFG"
            icon={FiIcons.FiCode}
            readOnly={!isEditing}
          />
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Via Roma 123"
            icon={FiIcons.FiMapPin}
            readOnly={!isEditing}
          />
          <Input
            label="City"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Milano"
            icon={FiIcons.FiMap}
            readOnly={!isEditing}
          />
          <Input
            label="Province"
            value={formData.province}
            onChange={(e) => handleInputChange('province', e.target.value)}
            placeholder="MI"
            icon={FiIcons.FiMapPin}
            readOnly={!isEditing}
          />
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-6">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="info@diplomatonline.it"
            icon={FiIcons.FiMail}
            readOnly={!isEditing}
          />
          <Input
            label="PEC"
            type="email"
            value={formData.pec}
            onChange={(e) => handleInputChange('pec', e.target.value)}
            placeholder="pec@diplomatonline.it"
            icon={FiIcons.FiShield}
            readOnly={!isEditing}
          />
          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+39 02 1234567"
            icon={FiIcons.FiPhone}
            readOnly={!isEditing}
          />
          <Input
            label="WhatsApp"
            type="tel"
            value={formData.whatsapp}
            onChange={(e) => handleInputChange('whatsapp', e.target.value)}
            placeholder="+39 320 1234567"
            icon={FiIcons.FiMessageCircle}
            readOnly={!isEditing}
          />
        </div>
      </Card>

      {/* Notes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Additional Notes
        </h3>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Enter additional company notes..."
          className={`w-full h-32 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
            !isEditing ? 'bg-neutral-50 cursor-not-allowed' : ''
          }`}
          readOnly={!isEditing}
        />
      </Card>

      {/* Company Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-6">
          Company Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-primary-50 rounded-xl"
          >
            <p className="text-2xl font-bold text-primary-600">{state.students.length}</p>
            <p className="text-sm text-neutral-500">Total Students</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-secondary-50 rounded-xl"
          >
            <p className="text-2xl font-bold text-secondary-600">{state.schools.length}</p>
            <p className="text-sm text-neutral-500">Partner Schools</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-accent-50 rounded-xl"
          >
            <p className="text-2xl font-bold text-accent-600">{state.courses.length}</p>
            <p className="text-sm text-neutral-500">Active Courses</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-orange-50 rounded-xl"
          >
            <p className="text-2xl font-bold text-orange-600">
              {state.students.reduce((sum, s) => sum + s.paidAmount, 0).toLocaleString()}€
            </p>
            <p className="text-sm text-neutral-500">Total Revenue</p>
          </motion.div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            icon={FiIcons.FiDownload}
            className="justify-start"
            onClick={handleExportData}
          >
            Export Company Data
          </Button>
          <Button
            variant="outline"
            icon={FiIcons.FiFileText}
            className="justify-start"
            onClick={handleGenerateReport}
          >
            Generate Monthly Report
          </Button>
          <Button
            variant="outline"
            icon={FiIcons.FiSettings}
            className="justify-start"
            onClick={() => toast.info('Advanced settings coming soon!')}
          >
            Advanced Settings
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CompanyConfig;