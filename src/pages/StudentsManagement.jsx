import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import StudentModal from '../components/modals/StudentModal';
import AssignSchoolModal from '../components/modals/AssignSchoolModal';
import { useApp } from '../context/AppContext';
import { generateStudentContract, sendEmail, emailTemplates, exportToCSV } from '../utils';
import toast from 'react-hot-toast';

const StudentsManagement = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [showAssignSchoolModal, setShowAssignSchoolModal] = useState(false);

  const filteredStudents = state.students
    .filter(student => {
      const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
      const matchesCourse = filterCourse === 'all' || student.course === filterCourse;
      return matchesSearch && matchesStatus && matchesCourse;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'enrollment':
          return new Date(b.enrollmentDate) - new Date(a.enrollmentDate);
        case 'course':
          return a.course.localeCompare(b.course);
        case 'payment':
          return (b.paidAmount / b.totalAmount) - (a.paidAmount / a.totalAmount);
        default:
          return 0;
      }
    });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <Badge variant="success">Active</Badge>;
      case 'suspended': return <Badge variant="warning">Suspended</Badge>;
      case 'completed': return <Badge variant="primary">Completed</Badge>;
      default: return <Badge variant="default">Unknown</Badge>;
    }
  };

  const getPaymentProgress = (student) => {
    const percentage = (student.paidAmount / student.totalAmount) * 100;
    return {
      percentage: Math.min(percentage, 100),
      remaining: student.totalAmount - student.paidAmount,
    };
  };

  const getAssignedSchool = (student) => {
    if (!student.assignedSchool) return null;
    return state.schools.find(school => school.id === student.assignedSchool);
  };

  const handleExport = () => {
    const data = filteredStudents.map(student => ({
      Name: student.firstName,
      Surname: student.lastName,
      Email: student.email,
      Phone: student.phone,
      Course: student.course,
      Status: student.status,
      'Total Amount': student.totalAmount,
      'Paid Amount': student.paidAmount,
      'Enrollment Date': new Date(student.enrollmentDate).toLocaleDateString('it-IT'),
      'Exam School': getAssignedSchool(student)?.name || 'Not assigned'
    }));

    exportToCSV(data, `students-export-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Export completed successfully!');
  };

  const handleSendEmail = async (student, template) => {
    const toastId = toast.loading('Sending email...');
    try {
      const emailData = emailTemplates[template](student);
      await sendEmail(student.email, emailData.subject, emailData.content, state.settings.emailSettings);

      const updatedStudent = {
        ...student,
        communications: [
          ...(student.communications || []),
          {
            id: Date.now(),
            type: 'email',
            subject: emailData.subject,
            sentAt: new Date().toISOString(),
            status: 'sent'
          }
        ]
      };

      dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
      toast.success('Email sent successfully!', { id: toastId });
    } catch (error) {
      toast.error('Error sending email', { id: toastId });
    }
  };

  const handleAssignSchool = (student) => {
    setSelectedStudent(student);
    setShowAssignSchoolModal(true);
  };

  const handleSchoolAssigned = (updatedStudent) => {
    const assignedSchool = getAssignedSchool(updatedStudent);
    toast.success(
      `Student assigned to ${assignedSchool?.name || 'no school'} for exams!`
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-800">
            Student Management
          </h1>
          <p className="text-neutral-600 mt-2">
            Manage all students enrolled in courses
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button
            variant="outline"
            icon={FiIcons.FiDownload}
            onClick={handleExport}
          >
            Export CSV
          </Button>
          <Button
            icon={FiIcons.FiPlus}
            onClick={() => {
              setModalType('student');
              setSelectedStudent(null);
              setShowModal(true);
            }}
          >
            New Student
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={FiIcons.FiSearch}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All courses</option>
            {state.courses.map(course => (
              <option key={course.id} value={course.name}>{course.name}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="name">Sort by name</option>
            <option value="enrollment">Enrollment date</option>
            <option value="course">Course</option>
            <option value="payment">Payment status</option>
          </select>
        </div>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.map((student, index) => {
          const paymentProgress = getPaymentProgress(student);
          const assignedSchool = getAssignedSchool(student);

          return (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-medium transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-medium">
                        {student.firstName[0]}{student.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-sm text-neutral-500">{student.email}</p>
                    </div>
                  </div>
                  {getStatusBadge(student.status)}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Course:</span>
                    <span className="font-medium text-neutral-800">{student.course}</span>
                  </div>

                  {/* School Assignment */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Exam School:</span>
                    <div className="flex items-center space-x-2">
                      {assignedSchool ? (
                        <span className="font-medium text-neutral-800 text-xs">
                          {assignedSchool.name}
                        </span>
                      ) : (
                        <span className="text-orange-600 text-xs">Not assigned</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={assignedSchool ? FiIcons.FiEdit : FiIcons.FiMapPin}
                        onClick={() => handleAssignSchool(student)}
                        className="p-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">Payments:</span>
                      <span className="font-medium text-neutral-800">
                        €{student.paidAmount} / €{student.totalAmount}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-accent-500 to-accent-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${paymentProgress.percentage}%` }}
                      />
                    </div>
                  </div>

                  {student.convertedFromLead && (
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiIcons.FiTarget} className="w-4 h-4 text-accent-500" />
                      <span className="text-xs text-accent-600 font-medium">
                        Converted from Lead
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t border-neutral-200">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={FiIcons.FiMail}
                      onClick={() => handleSendEmail(student, 'welcome')}
                    >
                      Email
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={FiIcons.FiEdit}
                      onClick={() => {
                        setSelectedStudent(student);
                        setModalType('student');
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Link to={`/students/${student.id}`}>
                      <Button size="sm" icon={FiIcons.FiEye}>
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiIcons.FiUsers} className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-800 mb-2">
            No students found
          </h3>
          <p className="text-neutral-500 mb-6">
            No students match the selected filters.
          </p>
          <Button
            icon={FiIcons.FiPlus}
            onClick={() => {
              setModalType('student');
              setSelectedStudent(null);
              setShowModal(true);
            }}
          >
            Add First Student
          </Button>
        </Card>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showModal && modalType === 'student' && (
          <StudentModal
            student={selectedStudent}
            onClose={() => {
              setShowModal(false);
              setSelectedStudent(null);
            }}
            mode={selectedStudent ? 'edit' : 'add'}
          />
        )}
        {showAssignSchoolModal && selectedStudent && (
          <AssignSchoolModal
            student={selectedStudent}
            onClose={() => {
              setShowAssignSchoolModal(false);
              setSelectedStudent(null);
            }}
            onAssign={handleSchoolAssigned}
          />
        )}
      </AnimatePresence>

      {/* Stats Footer */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-neutral-800">{state.students.length}</p>
            <p className="text-sm text-neutral-500">Total Students</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent-600">
              {state.students.filter(s => s.status === 'active').length}
            </p>
            <p className="text-sm text-neutral-500">Active</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-600">
              €{state.students.reduce((sum, s) => sum + s.paidAmount, 0).toLocaleString()}
            </p>
            <p className="text-sm text-neutral-500">Total Revenue</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning-600">
              €{state.students.reduce((sum, s) => sum + (s.totalAmount - s.paidAmount), 0).toLocaleString()}
            </p>
            <p className="text-sm text-neutral-500">Outstanding</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary-600">
              {state.students.filter(s => s.assignedSchool).length}
            </p>
            <p className="text-sm text-neutral-500">With Exam School</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudentsManagement;