import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { CameraIcon, AlertCircleIcon, InfoIcon, SparklesIcon } from '../../components/ui/Icons';
import { DEVICE_TYPES, DAMAGE_LEVELS } from '../../config/statusLifecycle';
import { uploadsApi, devicesApi } from '../../services/api';

export function AddDevice() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: 'PHONE',
    ageYears: '3',
    powersOn: 'true',
    damage: 'NONE',
    notes: '',
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photoFile) {
      setPhotoError('Please provide a photo of the device for AI evaluation.');
      return;
    }

    setSubmitting(true);
    setPhotoError('');
    setStatusMessage('Securing upload token...');

    try {
      // 1. Obtain presigned URL from backend S3 service (or dev fallback)
      const presignRes = await uploadsApi.getPresignedUrl({ contentType: photoFile.type });
      const { uploadUrl, key: photoKey } = presignRes;

      // 2. Perform direct upload
      setStatusMessage('Uploading device photo to storage...');
      if (uploadUrl) {
        try {
          await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': photoFile.type },
            body: photoFile,
          });
        } catch (uploadErr) {
          console.warn('Storage upload notice (dev mode fallback will apply):', uploadErr);
        }
      }

      // 3. Submit device specifications to backend for Bedrock AI triage and atomic passport creation
      setStatusMessage('Analyzing with Amazon Bedrock AI & creating passport...');
      const newDevice = await devicesApi.createDevice({
        type: formData.type,
        ageYears: Number(formData.ageYears),
        powersOn: formData.powersOn === 'true',
        damage: formData.damage,
        notes: formData.notes.trim(),
        photoKey,
      });

      // 4. Redirect to newly minted digital device passport
      navigate(`/citizen/devices/${newDevice._id}`);
    } catch (err) {
      console.error('Registration failed:', err);
      setPhotoError(err.message || 'Device registration failed. Please verify details and retry.');
    } finally {
      setSubmitting(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950">Register Device for Passport</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Provide device details and a clear photo to generate an AI disposition triage.
        </p>
      </div>

      {/* S3 Presigned Upload Architecture Notice */}
      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3 text-xs text-emerald-950">
        <InfoIcon className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block">S3 Upload & AI Triage:</span>
          Device images are stored securely with presigned URLs. Amazon Bedrock evaluates the photo evidence and device specifications to provide an advisory outcome (Repair, Reuse, Resale, Recycle).
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
              <label className="block text-sm font-medium text-zinc-800 mb-1">
                Device Photo <span className="text-red-600">*</span>
              </label>
              <p className="text-xs text-zinc-500 mb-3">
                Accepted: JPEG or PNG. Maximum size: 3 MB. Ensure clear lighting.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label
                  htmlFor="photo-upload-input"
                  className="cursor-pointer flex flex-col items-center justify-center w-full sm:w-48 h-36 border-2 border-dashed border-zinc-300 rounded-xl hover:border-forest-700 hover:bg-forest-50/40 transition-colors p-4 text-center focus-within:ring-2 focus-within:ring-forest-800"
                >
                  <CameraIcon className="w-8 h-8 text-forest-700 mb-2" />
                  <span className="text-xs font-semibold text-zinc-700">Choose Image</span>
                  <span className="text-[11px] text-zinc-400 mt-0.5">JPEG / PNG</span>
                  <input
                    id="photo-upload-input"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handlePhotoChange}
                    className="sr-only"
                  />
                </label>

                {/* Preview Box */}
                <div className="w-full sm:w-48 h-36 bg-zinc-100 rounded-xl border border-zinc-200 overflow-hidden flex items-center justify-center">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Device preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-zinc-400">Preview will appear here</span>
                  )}
                </div>
              </div>

              {photoError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700" role="alert">
                  <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />
                  <span>{photoError}</span>
                </div>
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
                <label className="block text-sm font-medium text-zinc-800 mb-1">
                  Does it power on? <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="inline-flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                    <input
                      type="radio"
                      name="powersOn"
                      value="true"
                      checked={formData.powersOn === 'true'}
                      onChange={() => setFormData({ ...formData, powersOn: 'true' })}
                      className="text-forest-800 focus:ring-forest-800"
                    />
                    <span>Yes, powers on</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                    <input
                      type="radio"
                      name="powersOn"
                      value="false"
                      checked={formData.powersOn === 'false'}
                      onChange={() => setFormData({ ...formData, powersOn: 'false' })}
                      className="text-forest-800 focus:ring-forest-800"
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

          <CardFooter className="justify-between flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/citizen/devices')}
            >
              Cancel
            </Button>
            <div className="flex items-center gap-3">
              {statusMessage && (
                <span className="text-xs font-mono text-forest-800 animate-pulse">
                  {statusMessage}
                </span>
              )}
              <Button type="submit" variant="primary" loading={submitting}>
                <SparklesIcon className="w-4 h-4 mr-1.5" />
                Submit for AI Analysis
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
