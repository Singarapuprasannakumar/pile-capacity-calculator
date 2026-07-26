import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Loader2, AlertCircle } from 'lucide-react';
import { listBoreholes, createBorehole, deleteBorehole, updateBorehole } from '../api/boreholeApi';
import BoreholeStatistics from '../components/boreholes/BoreholeStatistics';
import BoreholeList from '../components/boreholes/BoreholeList';
import EmptyBoreholes from '../components/boreholes/EmptyBoreholes';
import BoreholeForm from '../components/boreholes/BoreholeForm';

const Boreholes = ({ projectUuid }) => {
  const navigate = useNavigate();
  
  const [boreholes, setBoreholes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBorehole, setSelectedBorehole] = useState(null);

  const fetchBoreholes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listBoreholes(projectUuid);
      setBoreholes(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch borehole logs. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoreholes();
  }, [projectUuid]);

  const handleOpenWorkspace = (boreholeUuid) => {
    navigate(`/projects/${projectUuid}/boreholes/${boreholeUuid}`);
  };

  const handleCreateSave = async (payload) => {
    try {
      if (selectedBorehole) {
        // Edit
        await updateBorehole(selectedBorehole.uuid, payload);
      } else {
        // Create new
        await createBorehole(projectUuid, payload);
      }
      setIsFormOpen(false);
      setSelectedBorehole(null);
      await fetchBoreholes();
    } catch (err) {
      console.error(err);
      alert("Failed to save borehole details.");
    }
  };

  const handleArchive = async (boreholeUuid) => {
    if (!window.confirm("Are you sure you want to archive this borehole logging record?")) return;
    try {
      const b = boreholes.find(x => x.uuid === boreholeUuid);
      const payload = {
        name: b.name,
        location: b.location,
        ground_level: b.ground_level,
        termination_depth: b.termination_depth,
        groundwater_depth: b.groundwater_depth,
        drilling_method: b.drilling_method,
        remarks: b.remarks,
        status: 'Archived'
      };
      await updateBorehole(boreholeUuid, payload);
      await fetchBoreholes();
    } catch (err) {
      console.error(err);
      alert("Failed to archive borehole.");
    }
  };

  const handleDelete = async (boreholeUuid) => {
    if (!window.confirm("Are you sure you want to delete this borehole log? This will remove all soil layers and SPT blow counts permanently!")) return;
    try {
      await deleteBorehole(boreholeUuid);
      await fetchBoreholes();
    } catch (err) {
      console.error(err);
      alert("Failed to delete borehole.");
    }
  };

  // Filtered List
  const filteredBoreholes = boreholes.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.location && b.location.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === '' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-500">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="text-sm font-semibold">Loading borehole logs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2.5 p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
        <AlertCircle size={20} />
        <div>
          <h4 className="font-bold">Error</h4>
          <p className="text-sm mt-0.5">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Boreholes & Soil Stratigraphy</h3>
          <p className="text-xs font-semibold text-gray-400 mt-0.5">
            Geotechnical investigation boring logs database.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedBorehole(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl uppercase tracking-wider shadow-sm transition"
        >
          <Plus size={14} />
          New Borehole
        </button>
      </div>

      {/* Statistics */}
      {boreholes.length > 0 && <BoreholeStatistics boreholes={boreholes} />}

      {/* Search and Filters Bar */}
      {boreholes.length > 0 && (
        <div className="flex flex-col md:flex-row gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search boreholes by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs font-semibold border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-bold border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:border-blue-600 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Validated">Validated</option>
              <option value="Approved">Approved</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>
      )}

      {/* List Explorer */}
      {boreholes.length === 0 ? (
        <EmptyBoreholes onCreateClick={() => setIsFormOpen(true)} />
      ) : filteredBoreholes.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400 font-medium bg-gray-50/20 border border-dashed border-gray-100 rounded-2xl">
          No boreholes matched search criteria.
        </div>
      ) : (
        <BoreholeList
          boreholes={filteredBoreholes}
          onOpen={handleOpenWorkspace}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />
      )}

      {/* Creation/Edit Form Dialog */}
      {isFormOpen && (
        <BoreholeForm
          borehole={selectedBorehole}
          onClose={() => setIsFormOpen(false)}
          onSave={handleCreateSave}
        />
      )}
    </div>
  );
};

export default Boreholes;
