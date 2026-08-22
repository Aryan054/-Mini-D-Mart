import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../api/axios';
import { RotateCcw, Check, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ReturnsManagement: React.FC = () => {
  const { user } = useAuth();
  const [returns, setReturns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/staff/returns/');
      setReturns(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch returns', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processReturn = async (id: number, action: 'approve' | 'reject' | 'complete') => {
    try {
      await axiosInstance.post(`/staff/returns/${id}/${action}/`);
      fetchReturns();
    } catch (error: any) {
      alert(error.response?.data?.message || `Failed to ${action} return`);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      REQUESTED: 'bg-blue-100 text-blue-800',
      UNDER_REVIEW: 'bg-orange-100 text-orange-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
    };
    const style = styles[status] || 'bg-gray-100 text-gray-800';
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${style}`}>{status}</span>;
  };

  if (isLoading) return <div className="p-8 text-center">Loading returns...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Returns & Exchanges</h2>
      
      {returns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <RotateCcw className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No active returns</h3>
          <p className="text-gray-500">You're all caught up!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item & Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {returns.map((req) => (
                <tr key={req.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Order #{req.order}</div>
                    <div className="text-sm text-gray-500">{new Date(req.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">Item ID: {req.order_item} (Qty: {req.quantity})</div>
                    <div className="text-sm text-gray-500 mt-1 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1 text-orange-400" />
                      {req.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(req.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {req.status === 'REQUESTED' && user?.role === 'MANAGER' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => processReturn(req.id, 'approve')} className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded" title="Approve">
                          <Check size={18} />
                        </button>
                        <button onClick={() => processReturn(req.id, 'reject')} className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded" title="Reject">
                          <X size={18} />
                        </button>
                      </div>
                    )}
                    {req.status === 'APPROVED' && user?.role === 'MANAGER' && (
                      <button onClick={() => processReturn(req.id, 'complete')} className="text-blue-600 hover:text-blue-900 text-sm font-medium border border-blue-200 px-3 py-1 rounded-md hover:bg-blue-50">
                        Mark Completed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReturnsManagement;
