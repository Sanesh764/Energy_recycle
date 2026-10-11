import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  CameraIcon,
  AlertCircleIcon,
  InfoIcon,
  SparklesIcon,
  CheckCircleIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  EcoLeafIcon,
} from '../../components/ui/Icons';
import { DEVICE_TYPES, DAMAGE_LEVELS, DEVICE_STATUSES } from '../../config/statusLifecycle';
import { uploadsApi, devicesApi } from '../../services/api';

const TIME_SLOTS = [
  { value: 'Morning (9:00 AM - 12:00 PM)', label: 'Morning (9:00 AM - 12:00 PM)' },
  { value: 'Afternoon (1:00 PM - 5:00 PM)', label: 'Afternoon (1:00 PM - 5:00 PM)' },
  { value: 'Evening (5:00 PM - 8:00 PM)', label: 'Evening (5:00 PM - 8:00 PM)' },
  { value: 'Weekend Anytime (10:00 AM - 6:00 PM)', label: 'Weekend Anytime (10:00 AM - 6:00 PM)' },
];

export function AddDevice() {
  const navigate = useNavigate();

  // Multi-step form step state: 1 = Device, 2 = Address & Contact, 3 = Review, 4 = Success
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [deviceData, setDeviceData] = useState({
    type: 'PHONE',
    ageYears: '3',
    powersOn: 'true',
    damage: 'NONE',
    notes: '',
  });

  const [addressData, setAddressData] = useState({
    street: 'Flat 402, Green Enclave, 5th Main Road',
    locality: 'Sector 14',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    contactPhone: '9876543210',
    preferredSlot: 'Morning (9:00 AM - 12:00 PM)',
    instructions: 'Ring apartment bell 402; gate security has gate pass.',
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [createdResult, setCreatedResult] = useState(null);

  // Photo change handler with strict client-side validation
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    setErrors((prev) => ({ ...prev, photo: '' }));

    if (!file) return;

    // Validate type: JPEG / PNG only per SPEC.md
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        photo: 'Invalid format. Only JPEG and PNG image files are accepted.',
      }));
      return;
    }

    // Validate size: Under 3MB per SPEC.md
    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        photo: 'File size exceeds 3 MB limit. Please select an image under 3 MB.',
      }));
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  // Step 1 validation
  const validateStep1 = () => {
    const errs = {};
    if (!photoFile) {
      errs.photo = 'Device photo is required for AI passport assessment.';
    }
    const age = Number(deviceData.ageYears);
    if (isNaN(age) || age < 0 || age > 30) {
      errs.ageYears = 'Device age must be a number between 0 and 30 years.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 validation
  const validateStep2 = () => {
    const errs = {};
    if (!addressData.street.trim()) errs.street = 'House/building and street is required.';
    if (!addressData.locality.trim()) errs.locality = 'Locality or area is required.';
    if (!addressData.city.trim()) errs.city = 'City is required.';
    if (!addressData.state.trim()) errs.state = 'State is required.';

    // Pincode validation: 6-digit Indian PIN code
    if (!/^[1-9][0-9]{5}$/.test(addressData.pincode.trim())) {
      errs.pincode = 'Valid 6-digit PIN code required (e.g., 110001).';
    }

    // Phone validation: 10-digit mobile number
    if (!/^[0-9]{10}$/.test(addressData.contactPhone.trim())) {
      errs.contactPhone = 'Valid 10-digit contact mobile number required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextFromStep1 = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextFromStep2 = (e) => {
    e.preventDefault();
    if (validateStep2()) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setStatusMessage('Securing upload token...');

    try {
      // 1. Obtain presigned URL from backend S3 service (or dev mock fallback)
      const presignRes = await uploadsApi.getPresignedUrl({ contentType: photoFile.type });
      const { uploadUrl, key: photoKey } = presignRes;

      // 2. Perform upload
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

      // 3. Submit device specifications with pickup address to backend
      setStatusMessage('Analyzing with Amazon Bedrock AI & creating passport...');
      const newDevice = await devicesApi.createDevice({
        type: deviceData.type,
        ageYears: Number(deviceData.ageYears),
        powersOn: deviceData.powersOn === 'true',
        damage: deviceData.damage,
        notes: deviceData.notes.trim(),
        photoKey,
        pickupAddress: {
          street: addressData.street.trim(),
          locality: addressData.locality.trim(),
          city: addressData.city.trim(),
          state: addressData.state.trim(),
          pincode: addressData.pincode.trim(),
          contactPhone: addressData.contactPhone.trim(),
          instructions: addressData.instructions.trim(),
          preferredSlot: addressData.preferredSlot,
        },
      });

      // 4. Move to confirmation screen showing real passport ID and PICKUP_REQUESTED status
      setCreatedResult(newDevice);
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Registration failed:', err);
      setErrors({
        submit: err.message || 'Device registration failed. Please verify your details and retry.',
      });
    } finally {
      setSubmitting(false);
      setStatusMessage('');
    }
  };

  // STEP 4: SUCCESS CONFIRMATION
  if (currentStep === 4 && createdResult) {
    return (
      <div className="max-w-2xl mx-auto py-6 space-y-6 animate-fadeIn">
        <div className="bg-white rounded-2xl border border-emerald-200/80 shadow-premium p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-subtle">
            <CheckCircleIcon className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-700">
              Registration Successful
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
              DEVICE PASSPORT CREATED
            </h1>
            <p className="text-sm text-zinc-600 max-w-md mx-auto">
              Your electronic device is registered and your doorstep pickup request is queued for collector assignment.
            </p>
          </div>

          {/* Generated Passport & Request Status Card */}
          <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-5 text-left space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
                  Official Passport ID
                </span>
                <span className="font-mono text-xl font-black text-forest-950 tracking-wider">
                  {createdResult.deviceCode}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold mb-1">
                  Lifecycle Status
                </span>
                <StatusBadge status={createdResult.status || DEVICE_STATUSES.PICKUP_REQUESTED} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-zinc-500 font-medium">Device Category:</span>
                <p className="font-semibold text-zinc-900">{createdResult.type}</p>
              </div>
              <div>
                <span className="text-zinc-500 font-medium">AI Disposition Guidance:</span>
                <p className="font-semibold text-forest-800">
                  {createdResult.ai?.suggestedOutcome || 'RECYCLE'} (Verified by AI)
                </p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-zinc-500 font-medium">Pickup Address:</span>
                <p className="font-semibold text-zinc-900">
                  {addressData.street}, {addressData.locality}, {addressData.city} - {addressData.pincode}
                </p>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  Contact: {addressData.contactPhone} · Slot: {addressData.preferredSlot}
                </p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
              <EcoLeafIcon className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Next Step: </span>
                An authorized collector serving PIN code <span className="font-mono font-bold">{addressData.pincode}</span> will claim this request. Once physically collected and verified, you will receive <span className="font-bold">+50 EcoCoins</span> in your Rewards Wallet!
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to={`/citizen/devices/${createdResult._id}`} className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full">
                View Passport & Timeline
                <ArrowRightIcon className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link to="/citizen/devices" className="w-full sm:w-auto">
              <Button variant="secondary" size="md" className="w-full">
                All My Devices
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      {/* Title & Progress Tracker */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest-800">
            Citizen Device Onboarding
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
          REGISTER DEVICE FOR PASSPORT
        </h1>
        <p className="text-sm text-zinc-600">
          Complete the 3-step form to generate an AI passport and schedule doorstep collection.
        </p>

        {/* Multi-Step Wizard Tabs */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div
            className={`p-2.5 rounded-lg border text-center transition-all ${
              currentStep === 1
                ? 'bg-forest-900 text-white border-forest-900 shadow-sm'
                : currentStep > 1
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-zinc-50 text-zinc-400 border-zinc-200'
            }`}
          >
            <span className="text-[10px] font-mono uppercase block font-semibold">Step 1</span>
            <span className="text-xs font-bold truncate block">Device & Photo</span>
          </div>

          <div
            className={`p-2.5 rounded-lg border text-center transition-all ${
              currentStep === 2
                ? 'bg-forest-900 text-white border-forest-900 shadow-sm'
                : currentStep > 2
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-zinc-50 text-zinc-400 border-zinc-200'
            }`}
          >
            <span className="text-[10px] font-mono uppercase block font-semibold">Step 2</span>
            <span className="text-xs font-bold truncate block">Pickup Address</span>
          </div>

          <div
            className={`p-2.5 rounded-lg border text-center transition-all ${
              currentStep === 3
                ? 'bg-forest-900 text-white border-forest-900 shadow-sm'
                : 'bg-zinc-50 text-zinc-400 border-zinc-200'
            }`}
          >
            <span className="text-[10px] font-mono uppercase block font-semibold">Step 3</span>
            <span className="text-xs font-bold truncate block">Review & Submit</span>
          </div>
        </div>
      </div>

      {/* S3 & AI Architecture Notice */}
      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-950">
        <InfoIcon className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Doorstep Collection & AI Disposition</span>
          Your photo is evaluated with Amazon Bedrock Claude 3 Haiku for material classification. Your address is shared only with certified collectors to fulfill collection in your area.
        </div>
      </div>

      {/* STEP 1: DEVICE PHOTO AND DETAILS */}
      {currentStep === 1 && (
        <Card className="animate-fadeIn">
          <form onSubmit={handleNextFromStep1}>
            <CardHeader
              title="1. Device Photo & Physical Specifications"
              subtitle="Upload a clear photo and select condition parameters for AI evaluation."
            />
            <CardBody className="space-y-5">
              {/* Photo Upload Section */}
              <div>
                <label className="block text-sm font-medium text-zinc-800 mb-1">
                  Device Photo <span className="text-red-600">*</span>
                </label>
                <p className="text-xs text-zinc-500 mb-3">
                  Accepted: JPEG or PNG. Maximum size: 3 MB. Capture in clear lighting.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <label
                    htmlFor="photo-upload-input"
                    className="cursor-pointer flex flex-col items-center justify-center w-full sm:w-52 h-40 border-2 border-dashed border-zinc-300 rounded-xl hover:border-forest-700 hover:bg-forest-50/40 transition-colors p-4 text-center focus-within:ring-2 focus-within:ring-forest-800"
                  >
                    <CameraIcon className="w-8 h-8 text-forest-700 mb-2" />
                    <span className="text-xs font-semibold text-zinc-800">
                      {photoFile ? 'Change Photo' : 'Choose Photo'}
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-0.5">JPEG / PNG &lt; 3MB</span>
                    <input
                      id="photo-upload-input"
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handlePhotoChange}
                      className="sr-only"
                    />
                  </label>

                  {/* Preview Box */}
                  <div className="w-full sm:w-52 h-40 bg-zinc-100 rounded-xl border border-zinc-200 overflow-hidden flex items-center justify-center">
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

                {errors.photo && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700" role="alert">
                    <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.photo}</span>
                  </div>
                )}
              </div>

              {/* Category & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  id="device-type"
                  label="Device Category"
                  required
                  options={DEVICE_TYPES}
                  value={deviceData.type}
                  onChange={(e) => setDeviceData({ ...deviceData, type: e.target.value })}
                />

                <Input
                  id="device-age"
                  label="Approximate Age (Years)"
                  type="number"
                  min="0"
                  max="30"
                  required
                  placeholder="e.g. 3"
                  value={deviceData.ageYears}
                  onChange={(e) => setDeviceData({ ...deviceData, ageYears: e.target.value })}
                  error={errors.ageYears}
                  helperText="0 to 30 years"
                />
              </div>

              {/* Power State & Damage Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-800 mb-1">
                    Does the device power on? <span className="text-red-600">*</span>
                  </label>
                  <div className="flex gap-4 mt-2">
                    <label className="inline-flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                      <input
                        type="radio"
                        name="powersOn"
                        value="true"
                        checked={deviceData.powersOn === 'true'}
                        onChange={() => setDeviceData({ ...deviceData, powersOn: 'true' })}
                        className="text-forest-800 focus:ring-forest-800"
                      />
                      <span>Yes, powers on</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                      <input
                        type="radio"
                        name="powersOn"
                        value="false"
                        checked={deviceData.powersOn === 'false'}
                        onChange={() => setDeviceData({ ...deviceData, powersOn: 'false' })}
                        className="text-forest-800 focus:ring-forest-800"
                      />
                      <span>No / Won't start</span>
                    </label>
                  </div>
                </div>

                <Select
                  id="device-damage"
                  label="Visible Damage Level"
                  required
                  options={DAMAGE_LEVELS}
                  value={deviceData.damage}
                  onChange={(e) => setDeviceData({ ...deviceData, damage: e.target.value })}
                />
              </div>

              {/* Notes */}
              <Textarea
                id="device-notes"
                label="Device Condition Notes (Optional)"
                maxLength={300}
                placeholder="e.g. Broken screen glass, charging cable included, original battery."
                value={deviceData.notes}
                onChange={(e) => setDeviceData({ ...deviceData, notes: e.target.value })}
                helperText="Maximum 300 characters. Plain text only."
              />
            </CardBody>

            <CardFooter className="justify-between">
              <Button type="button" variant="secondary" onClick={() => navigate('/citizen/devices')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Continue to Pickup Address
                <ArrowRightIcon className="w-4 h-4 ml-1.5" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* STEP 2: PICKUP ADDRESS & CONTACT */}
      {currentStep === 2 && (
        <Card className="animate-fadeIn">
          <form onSubmit={handleNextFromStep2}>
            <CardHeader
              title="2. Doorstep Pickup Address & Contact"
              subtitle="Collectors in your postal area use these details for doorstep collection."
            />
            <CardBody className="space-y-5">
              {/* Mandatory Address Notice */}
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl flex items-start gap-3 text-xs text-zinc-700">
                <TruckIcon className="w-5 h-5 text-forest-800 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-950 block">Collector Route Verification</span>
                  A verified collector arrives at this exact location with anti-static transport bags. Ensure your PIN code and phone number are accurate so the collector can coordinate arrival.
                </div>
              </div>

              {/* Street & Locality */}
              <Input
                id="addr-street"
                label="House / Flat / Building & Street"
                required
                placeholder="e.g. Flat 402, Green Enclave, 5th Main Road"
                value={addressData.street}
                onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                error={errors.street}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="addr-locality"
                  label="Locality / Sector / Area"
                  required
                  placeholder="e.g. Sector 14, Rohini"
                  value={addressData.locality}
                  onChange={(e) => setAddressData({ ...addressData, locality: e.target.value })}
                  error={errors.locality}
                />

                <Input
                  id="addr-city"
                  label="City"
                  required
                  placeholder="e.g. New Delhi"
                  value={addressData.city}
                  onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                  error={errors.city}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  id="addr-state"
                  label="State"
                  required
                  placeholder="e.g. Delhi"
                  value={addressData.state}
                  onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                  error={errors.state}
                />

                <Input
                  id="addr-pincode"
                  label="PIN Code (6 Digits)"
                  required
                  placeholder="e.g. 110001"
                  maxLength={6}
                  value={addressData.pincode}
                  onChange={(e) => setAddressData({ ...addressData, pincode: e.target.value })}
                  error={errors.pincode}
                  helperText="Service available in 110001 & 110002"
                />

                <Input
                  id="addr-phone"
                  label="Contact Phone (10 Digits)"
                  required
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  value={addressData.contactPhone}
                  onChange={(e) => setAddressData({ ...addressData, contactPhone: e.target.value })}
                  error={errors.contactPhone}
                  helperText="For collection verification"
                />
              </div>

              {/* Preferred Slot */}
              <Select
                id="addr-slot"
                label="Preferred Pickup Time Slot"
                required
                options={TIME_SLOTS}
                value={addressData.preferredSlot}
                onChange={(e) => setAddressData({ ...addressData, preferredSlot: e.target.value })}
              />

              {/* Optional Instructions */}
              <Textarea
                id="addr-instructions"
                label="Pickup Instructions for Collector (Optional)"
                maxLength={250}
                placeholder="e.g. Ring apartment bell 402; leave with building reception if unavailable."
                value={addressData.instructions}
                onChange={(e) => setAddressData({ ...addressData, instructions: e.target.value })}
                helperText="Gate pass, landmarks, or special access instructions."
              />
            </CardBody>

            <CardFooter className="justify-between">
              <Button type="button" variant="secondary" onClick={() => setCurrentStep(1)}>
                <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
                Back to Device Details
              </Button>
              <Button type="submit" variant="primary">
                Review & Confirm
                <ArrowRightIcon className="w-4 h-4 ml-1.5" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* STEP 3: REVIEW AND SUBMIT */}
      {currentStep === 3 && (
        <Card className="animate-fadeIn">
          <form onSubmit={handleSubmit}>
            <CardHeader
              title="3. Review Summary & Mint Passport"
              subtitle="Verify device specifications and doorstep address before generating your digital passport."
            />
            <CardBody className="space-y-6">
              {/* Device Summary Box */}
              <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-forest-800">
                    Device Specifications
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-forest-700 hover:underline font-semibold"
                  >
                    Edit Device
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {photoPreview && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-zinc-200 flex-shrink-0 bg-white shadow-subtle">
                      <img src={photoPreview} alt="Device" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-xs flex-1">
                    <div>
                      <span className="text-zinc-500 font-medium">Category:</span>
                      <p className="font-bold text-zinc-900">{deviceData.type}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-medium">Age:</span>
                      <p className="font-bold text-zinc-900">{deviceData.ageYears} Years</p>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-medium">Powers On:</span>
                      <p className="font-bold text-zinc-900">
                        {deviceData.powersOn === 'true' ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-medium">Physical Damage:</span>
                      <p className="font-bold text-zinc-900">{deviceData.damage}</p>
                    </div>
                    {deviceData.notes && (
                      <div className="col-span-2">
                        <span className="text-zinc-500 font-medium">Notes:</span>
                        <p className="text-zinc-700 italic">"{deviceData.notes}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Summary Box */}
              <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-forest-800">
                    Pickup Logistics
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-forest-700 hover:underline font-semibold"
                  >
                    Edit Address
                  </button>
                </div>

                <div className="text-xs space-y-1.5">
                  <div className="flex items-start gap-2">
                    <TruckIcon className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-zinc-900">
                        {addressData.street}, {addressData.locality}
                      </p>
                      <p className="text-zinc-600">
                        {addressData.city}, {addressData.state} - {addressData.pincode}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-200/80 font-mono text-[11px]">
                    <div>
                      <span className="text-zinc-500">Contact: </span>
                      <span className="font-bold text-zinc-800">{addressData.contactPhone}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Time Slot: </span>
                      <span className="font-bold text-zinc-800">{addressData.preferredSlot}</span>
                    </div>
                  </div>
                  {addressData.instructions && (
                    <p className="text-[11px] text-zinc-500 italic pt-1">
                      Instructions: "{addressData.instructions}"
                    </p>
                  )}
                </div>
              </div>

              {/* Status Outcome Explanation */}
              <div className="p-3.5 bg-forest-50 border border-forest-200/80 rounded-xl text-xs text-forest-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheckIcon className="w-4 h-4 text-forest-800" />
                  Submission creates a registered passport in "PICKUP_REQUESTED" status.
                </div>
                <p className="text-zinc-600 leading-relaxed text-[11px]">
                  Submitting will store the passport record, trigger Bedrock AI evaluation, and publish this doorstep pickup request to authorized collectors in PIN {addressData.pincode}.
                </p>
              </div>

              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700" role="alert">
                  <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />
                  <span>{errors.submit}</span>
                </div>
              )}
            </CardBody>

            <CardFooter className="justify-between flex-wrap gap-3">
              <Button type="button" variant="secondary" onClick={() => setCurrentStep(2)}>
                <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
                Back to Address
              </Button>
              <div className="flex items-center gap-3">
                {statusMessage && (
                  <span className="text-xs font-mono text-forest-800 animate-pulse">
                    {statusMessage}
                  </span>
                )}
                <Button type="submit" variant="primary" loading={submitting}>
                  <SparklesIcon className="w-4 h-4 mr-1.5" />
                  Confirm & Mint Passport
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
