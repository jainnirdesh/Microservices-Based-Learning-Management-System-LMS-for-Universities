import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button } from '../components/Modal';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export function FacultySchedule() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [entries, setEntries] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    offeringId: '',
    teacherId: '',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    room: '',
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const isCoordinator = profile?.role === 'school_coordinator';

  const parseMeetingPattern = (pattern) => {
    if (!pattern) {
      return { day: 'Monday', startTime: '', endTime: '' };
    }

    const [dayPart, timePart] = String(pattern).split('|');
    const [startTime, endTime] = String(timePart || '').split('-');
    return {
      day: dayPart || 'Monday',
      startTime: startTime || '',
      endTime: endTime || '',
    };
  };

  const formatMeetingPattern = (day, startTime, endTime) => `${day}|${startTime}-${endTime}`;

  const fetchScheduleData = async () => {
    if (!profile?.id) return;

    setLoading(true);
    setErrorMessage('');

    let offeringsQuery = supabase
      .from('subject_offerings')
      .select('id, school_id, section_id, subject_id, teacher_id, room, meeting_pattern, status')
      .order('id', { ascending: false });

    if (isCoordinator) {
      offeringsQuery = offeringsQuery.eq('school_id', profile.school_id);
    } else {
      offeringsQuery = offeringsQuery.eq('teacher_id', profile.id);
    }

    const [{ data: offeringsData, error: offeringsError }, { data: teacherData, error: teacherError }] = await Promise.all([
      offeringsQuery,
      isCoordinator
        ? supabase
            .from('profiles')
            .select('id, full_name, role')
            .in('role', ['teacher', 'school_coordinator'])
            .eq('school_id', profile.school_id)
            .order('full_name', { ascending: true })
        : Promise.resolve({ data: [{ id: profile.id, full_name: profile.full_name || 'Teacher', role: profile.role }], error: null }),
    ]);

    if (offeringsError || teacherError) {
      setErrorMessage(offeringsError?.message || teacherError?.message || 'Failed to load schedule data.');
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

    const subjectMap = (subjectsData || []).reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
    const sectionMap = (sectionsData || []).reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
    const teacherMap = (teacherData || []).reduce((acc, item) => {
      acc[item.id] = item.full_name;
      return acc;
    }, {});

    const enrichedOfferings = (offeringsData || []).map((offering) => ({
      ...offering,
      subjectCode: subjectMap[offering.subject_id]?.code || 'SUB',
      subjectName: subjectMap[offering.subject_id]?.name || 'Subject',
      sectionCode: sectionMap[offering.section_id]?.code || 'SEC',
    }));

    const mappedEntries = enrichedOfferings
      .map((offering) => {
        const parsed = parseMeetingPattern(offering.meeting_pattern);
        return {
          id: offering.id,
          day: parsed.day,
          startTime: parsed.startTime,
          endTime: parsed.endTime,
          room: offering.room || '-',
          teacherId: offering.teacher_id || '',
          teacherName: offering.teacher_id ? (teacherMap[offering.teacher_id] || 'Teacher') : 'Not Assigned',
          subjectCode: offering.subjectCode,
          subjectName: offering.subjectName,
          sectionCode: offering.sectionCode,
          status: offering.status || 'active',
        };
      })
      .filter((item) => days.includes(item.day) && item.startTime)
      .sort((a, b) => {
        if (a.day !== b.day) return days.indexOf(a.day) - days.indexOf(b.day);
        return a.startTime.localeCompare(b.startTime);
      });

    setEntries(mappedEntries);
    setOfferings(enrichedOfferings);
    setTeachers(teacherData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchScheduleData();
    // eslint-disable-next-line
  }, [profile?.id, profile?.role, profile?.school_id]);

  const entriesByDay = useMemo(() => {
    return days.reduce((acc, day) => {
      acc[day] = entries.filter((item) => item.day === day);
      return acc;
    }, {});
  }, [entries]);

  const uniqueTeachers = useMemo(() => {
    return new Set(entries.map((item) => item.teacherId).filter(Boolean)).size;
  }, [entries]);

  const totalHours = useMemo(() => {
    const hours = entries.reduce((sum, item) => {
      const [sh, sm] = item.startTime.split(':').map(Number);
      const [eh, em] = item.endTime.split(':').map(Number);
      if ([sh, sm, eh, em].some(Number.isNaN)) return sum;
      const start = sh + sm / 60;
      const end = eh + em / 60;
      return sum + Math.max(0, end - start);
    }, 0);
    return Number(hours.toFixed(1));
  }, [entries]);

  const openCreateModal = () => {
    setSelectedEntry(null);
    setForm({
      offeringId: offerings[0]?.id ? String(offerings[0].id) : '',
      teacherId: '',
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      room: '',
    });
    setShowModal(true);
  };

  const openEditModal = (entry) => {
    setSelectedEntry(entry);
    setForm({
      offeringId: String(entry.id),
      teacherId: entry.teacherId || '',
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      room: entry.room === '-' ? '' : entry.room,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.offeringId) {
      setErrorMessage('Select an offering first.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    const payload = {
      meeting_pattern: formatMeetingPattern(form.day, form.startTime, form.endTime),
      room: form.room || null,
    };

    if (isCoordinator) {
      payload.teacher_id = form.teacherId || null;
    }

    let error = null;

    if (isCoordinator && !selectedEntry) {
      const baseOffering = offerings.find((item) => Number(item.id) === Number(form.offeringId));

      if (!baseOffering) {
        setErrorMessage('Selected offering not found.');
        setSaving(false);
        return;
      }

      const insertPayload = {
        school_id: baseOffering.school_id,
        section_id: baseOffering.section_id,
        subject_id: baseOffering.subject_id,
        teacher_id: form.teacherId || baseOffering.teacher_id || null,
        room: payload.room,
        meeting_pattern: payload.meeting_pattern,
        status: 'active',
      };

      const result = await supabase.from('subject_offerings').insert(insertPayload);
      error = result.error;
    } else {
      const result = await supabase
        .from('subject_offerings')
        .update(payload)
        .eq('id', Number(form.offeringId));
      error = result.error;
    }

    if (error) {
      setErrorMessage(error.message || 'Failed to save timetable.');
      setSaving(false);
      return;
    }

    setShowModal(false);
    setSaving(false);
    await fetchScheduleData();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Teaching Schedule</h2>
            <p className="text-gray-600">
              {isCoordinator
                ? 'School coordinator can assign timetable for all teachers.'
                : 'Your assigned weekly timetable from coordinator.'}
            </p>
          </div>
          {isCoordinator && (
            <button onClick={openCreateModal} className="btn-primary text-sm px-4 py-2">
              Assign Timetable
            </button>
          )}
        </div>

        {loading && <p className="text-sm text-gray-500 mb-4">Loading timetable from Supabase...</p>}
        {errorMessage && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">{errorMessage}</p>}

        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
          {days.map((day) => (
            <div key={day} className="border border-gray-200 rounded-lg p-3 bg-gray-50/60">
              <p className="text-sm font-semibold text-gray-900 mb-3">{day}</p>
              <div className="space-y-2">
                {entriesByDay[day]?.length ? (
                  entriesByDay[day].map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => openEditModal(entry)}
                      className="w-full text-left bg-blue-600 text-white p-2.5 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <p className="text-xs font-semibold">{entry.subjectCode} • {entry.sectionCode}</p>
                      <p className="text-xs opacity-90 mt-0.5">{entry.startTime} - {entry.endTime}</p>
                      <p className="text-xs opacity-90 mt-0.5">Room {entry.room}</p>
                      {isCoordinator && <p className="text-[11px] opacity-90 mt-0.5">{entry.teacherName}</p>}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No class assigned</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Timetable Visibility</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded border border-green-200">
                <div>
                  <p className="font-semibold text-gray-900">Role</p>
                  <p className="text-sm text-gray-600">{isCoordinator ? 'School Coordinator' : 'Teacher'}</p>
                </div>
                <span className="text-lg">✓</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded border border-green-200">
                <div>
                  <p className="font-semibold text-gray-900">Schedule Scope</p>
                  <p className="text-sm text-gray-600">{isCoordinator ? 'All teachers in your school' : 'Only your timetable'}</p>
                </div>
                <span className="text-lg">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Teaching Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2">
                <span className="text-gray-700">Classes per Week</span>
                <span className="font-bold text-purple-600">{entries.length}</span>
              </div>
              <div className="flex justify-between items-center p-2">
                <span className="text-gray-700">Total Teaching Hours</span>
                <span className="font-bold text-purple-600">{totalHours}</span>
              </div>
              <div className="flex justify-between items-center p-2">
                <span className="text-gray-700">Working Days</span>
                <span className="font-bold text-purple-600">{days.filter((day) => entriesByDay[day]?.length).length}</span>
              </div>
              <div className="flex justify-between items-center p-2">
                <span className="text-gray-700">Total Teachers</span>
                <span className="font-bold text-purple-600">{isCoordinator ? uniqueTeachers : 1}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        title={isCoordinator ? (selectedEntry ? 'Update Timetable Slot' : 'Assign Timetable Slot') : 'Class Details'}
        onClose={() => {
          setShowModal(false);
          setSelectedEntry(null);
        }}
      >
        {isCoordinator ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Subject Offering</label>
              <select
                value={form.offeringId}
                onChange={(e) => setForm({ ...form, offeringId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select offering</option>
                {offerings.map((offering) => {
                  const label = `${offering.subjectCode} - ${offering.subjectName} • ${offering.sectionCode}`;
                  return (
                    <option key={offering.id} value={offering.id}>{label}</option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Teacher</label>
              <select
                value={form.teacherId}
                onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Not assigned</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Day</label>
                <select
                  value={form.day}
                  onChange={(e) => setForm({ ...form, day: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {days.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Start</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">End</label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Room</label>
              <input
                type="text"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Room 301"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button type="submit" variant="primary" className="flex-1" disabled={saving}>
                {saving ? 'Saving...' : 'Save Timetable'}
              </Button>
              <Button type="button" onClick={() => setShowModal(false)} variant="secondary" className="flex-1">
                Close
              </Button>
            </div>
          </form>
        ) : selectedEntry ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Subject</p>
              <p className="font-semibold">{selectedEntry.subjectCode} - {selectedEntry.subjectName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Section</p>
              <p className="font-semibold">{selectedEntry.sectionCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Day</p>
              <p className="font-semibold">{selectedEntry.day}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Time</p>
              <p className="font-semibold">{selectedEntry.startTime} - {selectedEntry.endTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Room</p>
              <p className="font-semibold">{selectedEntry.room}</p>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={() => setShowModal(false)} variant="secondary" className="flex-1">
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
