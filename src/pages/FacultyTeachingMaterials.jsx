import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export function FacultyTeachingMaterials() {
  const { profile } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filterCourse, setFilterCourse] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    subjectId: '',
    title: '',
    type: 'PDF',
    description: '',
    sizeLabel: '',
    durationLabel: '',
  });

  const courses = useMemo(
    () => ['all', ...new Set(materials.map((m) => m.course).filter(Boolean))],
    [materials]
  );

  const filteredMaterials = filterCourse === 'all'
    ? materials
    : materials.filter((m) => m.course === filterCourse);

  const fetchMaterials = async () => {
    if (!profile?.id) return;

    setLoading(true);
    setErrorMessage('');

    let materialsQuery = supabase
      .from('learning_materials')
      .select('id, school_id, subject_offering_id, subject_id, teacher_id, title, material_type, description, size_label, duration_label, downloads, views, is_active, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    let offeringsQuery = supabase
      .from('subject_offerings')
      .select('id, school_id, section_id, subject_id, teacher_id, status')
      .eq('status', 'active');

    if (profile.role === 'school_coordinator' && profile.school_id) {
      materialsQuery = materialsQuery.eq('school_id', profile.school_id);
      offeringsQuery = offeringsQuery.eq('school_id', profile.school_id);
    } else {
      materialsQuery = materialsQuery.eq('teacher_id', profile.id);
      offeringsQuery = offeringsQuery.eq('teacher_id', profile.id);
    }

    const [{ data: materialsData, error: materialsError }, { data: offeringsData, error: offeringsError }, { data: schoolSubjectsData, error: subjectsError }] = await Promise.all([
      materialsQuery,
      offeringsQuery,
      profile.school_id
        ? supabase
            .from('subjects')
            .select('id, code, name')
            .eq('school_id', profile.school_id)
            .eq('is_active', true)
            .order('code', { ascending: true })
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (materialsError || offeringsError || subjectsError) {
      setErrorMessage(materialsError?.message || offeringsError?.message || subjectsError?.message || 'Failed to load materials.');
      setLoading(false);
      return;
    }

    const subjectIds = Array.from(new Set((offeringsData || []).map((item) => item.subject_id).filter(Boolean)));
    const sectionIds = Array.from(new Set((offeringsData || []).map((item) => item.section_id).filter(Boolean)));

    const [{ data: subjectsData }, { data: sectionsData }] = await Promise.all([
      subjectIds.length
        ? supabase.from('subjects').select('id, code, name').in('id', subjectIds)
        : Promise.resolve({ data: [] }),
      sectionIds.length
        ? supabase.from('sections').select('id, code, name').in('id', sectionIds)
        : Promise.resolve({ data: [] }),
    ]);

    const mergedSubjects = [...(schoolSubjectsData || []), ...(subjectsData || [])].reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});

    const subjectMap = mergedSubjects;

    const subjectOptions = Object.values(mergedSubjects)
      .sort((a, b) => String(a.code).localeCompare(String(b.code)))
      .map((subject) => ({
        id: subject.id,
        label: `${subject.code} - ${subject.name}`,
      }));

    const sectionMap = (sectionsData || []).reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});

    const offeringMap = (offeringsData || []).reduce((acc, offering) => {
      const subject = subjectMap[offering.subject_id];
      const section = sectionMap[offering.section_id];
      acc[offering.id] = {
        code: subject?.code || 'SUB',
        title: subject?.name || 'Subject',
        sectionCode: section?.code || 'SEC',
        subjectId: offering.subject_id,
      };
      return acc;
    }, {});

    // Fetch enrollment counts for offerings with materials
    const offeringIdsWithMaterials = Array.from(new Set((materialsData || []).map((m) => m.subject_offering_id).filter(Boolean)));
    const enrollmentCounts = {};
    
    if (offeringIdsWithMaterials.length > 0) {
      const { data: enrollmentsData } = await supabase
        .from('student_enrollments')
        .select('subject_offering_id')
        .in('subject_offering_id', offeringIdsWithMaterials);
      
      if (enrollmentsData) {
        enrollmentsData.forEach((enrollment) => {
          if (enrollment.subject_offering_id) {
            enrollmentCounts[enrollment.subject_offering_id] = (enrollmentCounts[enrollment.subject_offering_id] || 0) + 1;
          }
        });
      }
    }

    const mappedMaterials = (materialsData || []).map((material) => {
      const offeringInfo = offeringMap[material.subject_offering_id] || {};
      const directSubject = subjectMap[material.subject_id] || null;
      const resolvedCode = directSubject?.code || offeringInfo.code || 'General';
      const resolvedTitle = directSubject?.name || offeringInfo.title || 'General';
      const studentCount = material.subject_offering_id ? enrollmentCounts[material.subject_offering_id] || 0 : 0;
      return {
        id: material.id,
        title: material.title,
        type: material.material_type,
        description: material.description,
        course: resolvedCode,
        courseLabel: `${resolvedCode} - ${resolvedTitle}`,
        sectionCode: offeringInfo.sectionCode,
        size: material.size_label,
        duration: material.duration_label,
        downloads: material.downloads || 0,
        views: material.views || 0,
        studentCount: studentCount,
      };
    });

    const mappedOfferings = (offeringsData || []).map((offering) => {
      const subject = subjectMap[offering.subject_id];
      const section = sectionMap[offering.section_id];
      return {
        id: offering.id,
        label: `${subject?.code || 'SUB'} - ${subject?.name || 'Subject'} • ${section?.code || 'SEC'}`,
      };
    });

    setMaterials(mappedMaterials);
    setOfferings(mappedOfferings);
    setSubjects(subjectOptions);
    setNewMaterial((prev) => ({ ...prev, subjectId: subjectOptions[0]?.id ? String(subjectOptions[0].id) : '' }));
    setLoading(false);
  };

  useEffect(() => {
    fetchMaterials();
    // eslint-disable-next-line
  }, [profile?.id, profile?.role, profile?.school_id]);

  const handleUpload = async () => {
    if (!newMaterial.title.trim() || !newMaterial.subjectId) {
      setErrorMessage('Select subject and enter title.');
      return;
    }

    if (!profile?.school_id) {
      setErrorMessage('Your school is not assigned in profile.');
      return;
    }

    setUploading(true);
    setErrorMessage('');

    let resolvedOfferingId = null;
    const { data: matchedOffering } = await supabase
      .from('subject_offerings')
      .select('id')
      .eq('school_id', profile.school_id)
      .eq('subject_id', Number(newMaterial.subjectId))
      .limit(1)
      .maybeSingle();

    if (matchedOffering?.id) {
      resolvedOfferingId = matchedOffering.id;
    }

    const payload = {
      school_id: profile.school_id,
      subject_offering_id: resolvedOfferingId,
      subject_id: Number(newMaterial.subjectId),
      teacher_id: profile.id,
      title: newMaterial.title.trim(),
      material_type: newMaterial.type,
      description: newMaterial.description.trim() || null,
      size_label: newMaterial.sizeLabel.trim() || null,
      duration_label: newMaterial.durationLabel.trim() || null,
      downloads: 0,
      views: 0,
      is_active: true,
    };

    const { error } = await supabase.from('learning_materials').insert(payload);
    if (error) {
      setErrorMessage(error.message || 'Failed to upload material.');
      setUploading(false);
      return;
    }

    setNewMaterial({
      subjectId: subjects[0]?.id ? String(subjects[0].id) : '',
      title: '',
      type: 'PDF',
      description: '',
      sizeLabel: '',
      durationLabel: '',
    });
    setShowUploadModal(false);
    setSuccessMessage('Material uploaded successfully.');
    setUploading(false);
    await fetchMaterials();
  };

  const handleDeleteMaterial = async (materialId) => {
    const { error } = await supabase
      .from('learning_materials')
      .update({ is_active: false })
      .eq('id', materialId);

    if (error) {
      setErrorMessage(error.message || 'Failed to delete material.');
      return;
    }

    setMaterials((prev) => prev.filter((m) => m.id !== materialId));
    setSuccessMessage('Material removed.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teaching Materials</h2>
          <p className="text-gray-600 mt-1">Upload and manage lecture materials for your subjects</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
        >
          + Upload Material
        </button>
      </div>

      {/* Stats */}
      {loading && <p className="text-sm text-gray-500">Loading materials from Supabase...</p>}
      {errorMessage && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{errorMessage}</p>}
      {successMessage && <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">{successMessage}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-blue-500">
          <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
          <p className="text-sm text-gray-600 mt-1">Total Materials</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-green-500">
          <p className="text-2xl font-bold text-gray-900">{new Set(materials.map(m => m.course)).size}</p>
          <p className="text-sm text-gray-600 mt-1">Subjects</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-purple-500">
          <p className="text-2xl font-bold text-gray-900">{materials.reduce((sum, m) => sum + (m.downloads || 0), 0)}</p>
          <p className="text-sm text-gray-600 mt-1">Total Downloads</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-orange-500">
          <p className="text-2xl font-bold text-gray-900">{materials.reduce((sum, m) => sum + (m.views || 0), 0)}</p>
          <p className="text-sm text-gray-600 mt-1">Total Views</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Subject</label>
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
        >
          {courses.map(course => (
            <option key={course} value={course}>
              {course === 'all' ? 'All Subjects' : course}
            </option>
          ))}
        </select>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map(material => (
          <div key={material.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                {material.type}
              </div>
              <button onClick={() => handleDeleteMaterial(material.id)} className="text-gray-500 hover:text-red-500 text-xl">
                ✕
              </button>
            </div>

            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{material.title}</h3>
            <p className="text-xs text-gray-500 mb-2">{material.courseLabel} • {material.sectionCode}</p>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {material.size && <p>📦 {material.size}</p>}
              {material.duration && <p>⏱️ {material.duration}</p>}
              {material.downloads && <p>⬇️ Downloads: {material.downloads}</p>}
              {material.views && <p>👁️ Views: {material.views}</p>}
            </div>

            <div className="flex gap-2 text-xs text-gray-600 mb-4">
              <span className="px-2 py-1 bg-gray-100 rounded">Shared with {material.studentCount} student{material.studentCount !== 1 ? 's' : ''}</span>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded font-medium text-sm hover:bg-blue-200 transition-colors">
                Edit
              </button>
              <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded font-medium text-sm hover:bg-gray-200 transition-colors">
                Share More
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 text-lg">No materials found for this subject</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Material</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <select
                  value={newMaterial.subjectId}
                  onChange={(e) => setNewMaterial({ ...newMaterial, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                >
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>{subject.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Material Type</label>
                <select
                  value={newMaterial.type}
                  onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                >
                  <option>PDF</option>
                  <option>Video</option>
                  <option>Interactive</option>
                  <option>Presentation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newMaterial.title}
                  onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                  placeholder="Material title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                  placeholder="What is this material about?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">File Size (optional)</label>
                <input
                  type="text"
                  value={newMaterial.sizeLabel}
                  onChange={(e) => setNewMaterial({ ...newMaterial, sizeLabel: e.target.value })}
                  placeholder="2.4 MB"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (optional)</label>
                <input
                  type="text"
                  value={newMaterial.durationLabel}
                  onChange={(e) => setNewMaterial({ ...newMaterial, durationLabel: e.target.value })}
                  placeholder="120 mins"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
