import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-6">APK Generation</h2>
            
            <div className="space-y-4 text-sm text-gray-600">
              <p>To convert this web app into a signed Android APK, follow these steps:</p>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <span className="font-semibold">Initialize Capacitor:</span>
                  <code className="block bg-gray-100 p-2 mt-1 rounded font-mono text-xs">npx cap init</code>
                </li>
                <li>
                  <span className="font-semibold">Add Android Platform:</span>
                  <code className="block bg-gray-100 p-2 mt-1 rounded font-mono text-xs">npx cap add android</code>
                </li>
                <li>
                  <span className="font-semibold">Build the Web App:</span>
                  <code className="block bg-gray-100 p-2 mt-1 rounded font-mono text-xs">npm run build</code>
                </li>
                <li>
                  <span className="font-semibold">Sync Assets:</span>
                  <code className="block bg-gray-100 p-2 mt-1 rounded font-mono text-xs">npx cap sync</code>
                </li>
                <li>
                  <span className="font-semibold">Open in Android Studio:</span>
                  <code className="block bg-gray-100 p-2 mt-1 rounded font-mono text-xs">npx cap open android</code>
                </li>
                <li>
                  <span className="font-semibold">Generate Signed APK:</span>
                  <p className="mt-1 ml-4">In Android Studio, go to <span className="italic">Build &gt; Generate Signed Bundle/APK</span> and follow the wizard.</p>
                </li>
              </ol>
              <p className="mt-6 text-xs text-gray-400 italic">
                Note: For precise scheduling and reboot persistence on Android, use the Capacitor Local Notifications plugin.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
