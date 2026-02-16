/**
 * 404 Not Found Page
 */

import { useNavigate } from 'react-router';
import { Button } from '@nextui-org/react';
import { Home, AlertCircle } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-red-100 rounded-full p-6">
            <AlertCircle size={64} className="text-red-600" />
          </div>
        </div>
        
        <div>
          <h1 className="text-6xl font-bold text-slate-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-slate-700 mb-2">Page Not Found</h2>
          <p className="text-slate-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Button
          color="primary"
          size="lg"
          startContent={<Home />}
          onPress={() => navigate('/')}
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
