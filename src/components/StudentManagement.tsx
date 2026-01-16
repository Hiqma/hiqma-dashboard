'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User,
  Plus,
  Pencil,
  Trash2,
  Download,
  Upload,
  Copy,
  Search,
  AlertTriangle,
  GraduationCap
} from 'lucide-react';
import { studentsController, Student, CreateStudentRequest, UpdateStudentRequest } from '@/controllers/studentsController';
import { useToast } from '@/contexts/ToastContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentStats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentStats?.active || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Age</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentStats?.averageAge ? Math.round(studentStats.averageAge) : 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grades</CardTitle>
            <div className="h-4 w-4 rounded-full bg-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentStats?.byGrade ? Object.keys(studentStats.byGrade).length : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
            
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={gradeFilter}
              onValueChange={(value) => {
                setGradeFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {grades.map(grade => (
                  <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowImportModal(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button
              variant="outline"
              onClick={handleExportStudents}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <Card>
        {isLoading ? (
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsData?.students?.map((student: Student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {getDisplayName(student)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Created {formatDate(student.createdAt)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                          {student.studentCode}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(student.studentCode)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {student.grade ? `Grade ${student.grade}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {student.age || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStudent(student)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDeleteModal(student.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {studentsData?.students?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No students found matching your search.' : 'No students added yet'}
              </div>
            )}
            
            {/* Pagination */}
            {studentsData && studentsData.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {studentsData.totalPages} ({studentsData.total} total students)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(studentsData.totalPages, prev + 1))}
                    disabled={currentPage === studentsData.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Create Student Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Create a new student account. A unique student code will be generated automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name (Optional)</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name (Optional)</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="grade">Grade (Optional)</Label>
              <Select
                value={formData.grade}
                onValueChange={(value) => setFormData({ ...formData, grade: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(grade => (
                    <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="age">Age (Optional)</Label>
              <Input
                id="age"
                type="number"
                min="3"
                max="18"
                value={formData.age || ''}
                onChange={(e) => setFormData({ ...formData, age: e.target.value && !isNaN(parseInt(e.target.value)) ? parseInt(e.target.value) : undefined })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitCreate}
              disabled={createStudentMutation.isPending}
            >
              {createStudentMutation.isPending ? 'Creating...' : 'Create Student'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Modal */}
      <Dialog open={!!showEditModal} onOpenChange={(open) => !open && setShowEditModal(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information. The student code cannot be changed.
            </DialogDescription>
          </DialogHeader>
          {showEditModal && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="studentCode">Student Code</Label>
                <Input
                  id="studentCode"
                  value={showEditModal.studentCode}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editFirstName">First Name (Optional)</Label>
                <Input
                  id="editFirstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editLastName">Last Name (Optional)</Label>
                <Input
                  id="editLastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editGrade">Grade (Optional)</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) => setFormData({ ...formData, grade: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map(grade => (
                      <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editAge">Age (Optional)</Label>
                <Input
                  id="editAge"
                  type="number"
                  min="3"
                  max="18"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value && !isNaN(parseInt(e.target.value)) ? parseInt(e.target.value) : undefined })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitEdit}
              disabled={updateStudentMutation.isPending}
            >
              {updateStudentMutation.isPending ? 'Updating...' : 'Update Student'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Students from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import multiple students at once.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="csvFile">CSV File</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-muted-foreground">
                CSV should have columns: firstName, lastName, grade, age
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowImportModal(false);
                setImportFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => importFile && importCSVMutation.mutate(importFile)}
              disabled={!importFile || importCSVMutation.isPending}
            >
              {importCSVMutation.isPending ? 'Importing...' : 'Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!showDeleteModal} onOpenChange={(open) => !open && setShowDeleteModal(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <DialogTitle>Deactivate Student</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to deactivate this student? They will no longer be able to log in, but their data will be preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteModal && deactivateStudentMutation.mutate(showDeleteModal)}
              disabled={deactivateStudentMutation.isPending}
            >
              {deactivateStudentMutation.isPending ? 'Deactivating...' : 'Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}