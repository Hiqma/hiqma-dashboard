'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UserIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { studentsController, Student, CreateStudentRequest, UpdateStudentRequest } from '@/controllers/studentsController';
import { useToast } from '@/contexts/ToastContext';

interface StudentManagementProps {
  hubId: string;
}

export default function StudentManagement({ hubId }: StudentManagementProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Student | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Form state for create/edit
  const [formData, setFormData] = useState<CreateStudentRequest>({
    firstName: '',
    lastName: '',
    grade: '',
    age: undefined,
    metadata: {},
  });

  // Fetch students
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['hub-students', hubId, statusFilter, gradeFilter, searchTerm, currentPage],
    queryFn: () => studentsController.getHubStudents(hubId, {
      status: statusFilter === 'all' ? undefined : statusFilter,
      grade: gradeFilter === 'all' ? undefined : gradeFilter,
      search: searchTerm || undefined,
      page: currentPage,
      limit: 10
    }),
  });

  // Fetch student stats
  const { data: studentStats } = useQuery({
    queryKey: ['hub-student-stats', hubId],
    queryFn: () => studentsController.getStudentStats(hubId),
  });

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: (data: CreateStudentRequest) => studentsController.createStudent(hubId, data),
    onSuccess: (student) => {
      queryClient.invalidateQueries({ queryKey: ['hub-students'] });
      queryClient.invalidateQueries({ queryKey: ['hub-student-stats'] });
      setShowCreateModal(false);
      resetForm();
      showToast('success', 'Student Created', `Student ${student.studentCode} created successfully`);
    },
    onError: (error: Error) => {
      showToast('error', 'Creation Failed', error.message);
    }
  });

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: ({ studentId, data }: { studentId: string; data: UpdateStudentRequest }) => 
      studentsController.updateStudent(studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hub-students'] });
      queryClient.invalidateQueries({ queryKey: ['hub-student-stats'] });
      setShowEditModal(null);
      resetForm();
      showToast('success', 'Student Updated', 'Student information updated successfully');
    },
    onError: (error: Error) => {
      showToast('error', 'Update Failed', error.message);
    }
  });

  // Deactivate student mutation
  const deactivateStudentMutation = useMutation({
    mutationFn: (studentId: string) => studentsController.deactivateStudent(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hub-students'] });
      queryClient.invalidateQueries({ queryKey: ['hub-student-stats'] });
      setShowDeleteModal(null);
      showToast('success', 'Student Deactivated', 'Student deactivated successfully');
    },
    onError: (error: Error) => {
      showToast('error', 'Deactivation Failed', error.message);
    }
  });

  // Import CSV mutation
  const importCSVMutation = useMutation({
    mutationFn: (file: File) => studentsController.importFromCSV(hubId, file),
    onSuccess: (students) => {
      queryClient.invalidateQueries({ queryKey: ['hub-students'] });
      queryClient.invalidateQueries({ queryKey: ['hub-student-stats'] });
      setShowImportModal(false);
      setImportFile(null);
      showToast('success', 'Import Complete', `Successfully imported ${students.length} students`);
    },
    onError: (error: Error) => {
      showToast('error', 'Import Failed', error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      grade: '',
      age: undefined,
      metadata: {},
    });
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast('success', 'Copied', 'Student code copied to clipboard');
    } catch (error) {
      showToast('error', 'Copy Failed', 'Failed to copy student code');
    }
  };

  const handleExportStudents = async () => {
    try {
      const blob = await studentsController.exportStudents(hubId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hub-${hubId}-students.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('success', 'Export Complete', 'Students exported successfully');
    } catch (error) {
      showToast('error', 'Export Failed', 'Failed to export students');
    }
  };

  const handleEditStudent = (student: Student) => {
    setFormData({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      grade: student.grade || '',
      age: student.age,
      metadata: student.metadata || {},
    });
    setShowEditModal(student);
  };

  const handleSubmitCreate = () => {
    createStudentMutation.mutate(formData);
  };

  const handleSubmitEdit = () => {
    if (showEditModal) {
      updateStudentMutation.mutate({
        studentId: showEditModal.id,
        data: formData,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDisplayName = (student: Student) => {
    if (student.firstName && student.lastName) {
      return `${student.firstName} ${student.lastName}`;
    }
    if (student.firstName) {
      return student.firstName;
    }
    return `Student ${student.studentCode}`;
  };

  const grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-black mt-1">{studentStats?.total || 0}</p>
            </div>
            <UserIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-black mt-1">{studentStats?.active || 0}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Age</p>
              <p className="text-2xl font-bold text-black mt-1">
                {studentStats?.averageAge ? Math.round(studentStats.averageAge) : 'N/A'}
              </p>
            </div>
            <AcademicCapIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Grades</p>
              <p className="text-2xl font-bold text-black mt-1">
                {studentStats?.byGrade ? Object.keys(studentStats.byGrade).length : 0}
              </p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-black"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={gradeFilter}
              onChange={(e) => {
                setGradeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-black"
            >
              <option value="all">All Grades</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <DocumentArrowUpIcon className="h-4 w-4" />
              Import
            </button>
            <button
              onClick={handleExportStudents}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Add Student
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentsData?.students?.map((student: Student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="h-8 w-8 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {getDisplayName(student)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Created {formatDate(student.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                            {student.studentCode}
                          </code>
                          <button
                            onClick={() => handleCopyCode(student.studentCode)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Copy code"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.grade ? `Grade ${student.grade}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.age || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                            title="Edit student"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(student.id)}
                            className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                            title="Deactivate student"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {studentsData?.students?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No students found matching your search.' : 'No students added yet'}
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {studentsData && studentsData.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {studentsData.totalPages} ({studentsData.total} total students)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(studentsData.totalPages, prev + 1))}
                    disabled={currentPage === studentsData.totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Student Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Student</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade (Optional)
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">Select Grade</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age (Optional)
                </label>
                <input
                  type="number"
                  min="3"
                  max="18"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-500">
                A unique student code will be generated automatically
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCreate}
                disabled={createStudentMutation.isPending}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {createStudentMutation.isPending ? 'Creating...' : 'Create Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Student</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Code
                </label>
                <input
                  type="text"
                  value={showEditModal.studentCode}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade (Optional)
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">Select Grade</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age (Optional)
                </label>
                <input
                  type="number"
                  min="3"
                  max="18"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEdit}
                disabled={updateStudentMutation.isPending}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {updateStudentMutation.isPending ? 'Updating...' : 'Update Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Import Students from CSV</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  CSV should have columns: firstName, lastName, grade, age
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                }}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => importFile && importCSVMutation.mutate(importFile)}
                disabled={!importFile || importCSVMutation.isPending}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {importCSVMutation.isPending ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900">Deactivate Student</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to deactivate this student? They will no longer be able to log in, but their data will be preserved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deactivateStudentMutation.mutate(showDeleteModal)}
                disabled={deactivateStudentMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deactivateStudentMutation.isPending ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}