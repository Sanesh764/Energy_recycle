import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { CameraIcon, AlertCircleIcon, InfoIcon } from '../../components/ui/Icons';
import { DEVICE_TYPES, DAMAGE_LEVELS } from '../../config/statusLifecycle';

export function AddDevice() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: 'PHONE',
    ageYears: '',
    powersOn: 'true',
    damage: 'NONE',
    notes: '',
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    setPhotoError('');

    if (!file) return;

    // Validate type: JPEG / PNG only per SPEC.md
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Invalid file type. Only JPEG and PNG formats are accepted.');
      return;
    }

    // Validate size: Under 3MB per SPEC.md
    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      setPhotoError('Image size exceeds 3 MB limit. Please select a smaller photo.');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!photoFile) {
      setPhotoError('Please provide a photo of the device for AI evaluation.');
      return;
    }
    setSubmitting(true);
    // Boundary notice: In FRONTEND-1, backend API is not called directly.
    setTimeout(() => {
      setSubmitting(false);
      navigate('/citizen/devices');
    }, 600);
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Register Device for Passport</h1>
        <p className="text-sm text-slate-500 mt-1">
          Provide device details and a clear photo to generate an AI disposition triage.
        </p>
      </div>

      {/* S3 Presigned Upload Abstraction Notice */}
      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3 text-xs text-emerald-900">
        <InfoIcon className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block">S3 Upload Architecture Notice:</span>
          In production, device images are uploaded directly to a private AWS S3 bucket via presigned PUT URLs, client-resized below 1024px. The file preview below runs client-side without hitting external storage.
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader
            title="Device Specifications & Physical Condition"
            subtitle="Answer accurately to receive the most reliable disposition guidance."
          />
          <CardBody className="space-y-5">
            {/* Photo Upload Section */}
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">
                Device Photo <span className="text-red-600">*</span>
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Accepted: JPEG or PNG. Maximum size: 3 MB. Ensure clear lighting.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label
                  htmlFor="photo-upload-input"
                  className="cursor-pointer flex flex-col items-center justify-center w-full sm:w-48 h-36 border-2 border-dashed border-slate-300 rounded-xl hover:border-emerald-600 hover:bg-emerald-50/30 transition-colors p-4 text-center focus-within:ring-2 focus-within:ring-emerald-700"
                >
                  <CameraIcon className="w-8 h-8 text-emerald-700 mb-2" />
                  <span className="text-xs font-semibold text-slate-700">Choose Image</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">JPEG / PNG</span>
                  <input
                    id="photo-upload-input"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handlePhotoChange}
                    className="sr-only"
                  />
                </label>

                {/* Preview Box */}
                <div className="w-full sm:w-48 h-36 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Device preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">Preview will appear here</span>
                  )}
                </div>
              </div>

              {photoError && (
                <p className="mt-2 text-xs text-red-600 font-medium" role="alert">
                  {photoError}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Device Type */}
              <Select
                id="device-type"
                label="Device Category"
                required
                options={DEVICE_TYPES}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />

              {/* Age in Years */}
              <Input
                id="device-age"
                label="Age (Years)"
                type="number"
                min="0"
                max="30"
                required
                placeholder="e.g. 3"
                value={formData.ageYears}
                onChange={(e) => setFormData({ ...formData, ageYears: e.target.value })}
                helperText="Approximate age (0 to 30 years)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Powers On */}
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">
                  Does it power on? <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="powersOn"
                      value="true"
                      checked={formData.powersOn === 'true'}
                      onChange={() => setFormData({ ...formData, powersOn: 'true' })}
                      className="text-emerald-700 focus:ring-emerald-700"
                    />
                    <span>Yes, powers on</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="powersOn"
                      value="false"
                      checked={formData.powersOn === 'false'}
                      onChange={() => setFormData({ ...formData, powersOn: 'false' })}
                      className="text-emerald-700 focus:ring-emerald-700"
                    />
                    <span>No / Won't start</span>
                  </label>
                </div>
              </div>

              {/* Visible Damage */}
              <Select
                id="device-damage"
                label="Visible Damage Level"
                required
                options={DAMAGE_LEVELS}
                value={formData.damage}
                onChange={(e) => setFormData({ ...formData, damage: e.target.value })}
              />
            </div>

            {/* Optional Notes */}
            <Textarea
              id="device-notes"
              label="Optional Notes"
              maxLength={300}
              placeholder="e.g. Original charger included; battery holds charge for ~1 hour."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              helperText="Maximum 300 characters. Treated as plain data."
            />
          </CardBody>

          <CardFooter className="justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/citizen/devices')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Submit for AI Analysis
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
