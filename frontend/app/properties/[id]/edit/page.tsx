'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { propertiesAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const PROPERTY_TYPES = ['APARTMENT', 'HOUSE', 'VILLA', 'PLOT', 'COMMERCIAL'];
const LISTING_TYPES = ['SALE', 'RENT'];
const FURNISHING_TYPES = ['UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED'];

const COMMON_AMENITIES = [
  'Parking',
  'Gym',
  'Swimming Pool',
  'Garden',
  'Security',
  'Power Backup',
  'Elevator',
  'Clubhouse',
  'Play Area',
  'Water Supply',
  'WiFi',
  'Air Conditioning',
];

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [property, setProperty] = useState<any>(null);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'APARTMENT',
    listingType: 'SALE',
    price: '',
    deposit: '',
    bedrooms: '',
    bathrooms: '',
    areaSqft: '',
    furnishing: 'UNFURNISHED',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    availableFrom: '',
  });

  const [images, setImages] = useState<string[]>(['']);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'OWNER' && user?.role !== 'ADMIN') {
        router.push('/properties');
      } else {
        fetchProperty();
      }
    }
  }, [isAuthenticated, authLoading, user]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getById(propertyId);
      const propertyData = response.data;

      // Check if user owns this property
      if (propertyData.userId !== user?.id && user?.role !== 'ADMIN') {
        alert('You are not authorized to edit this property');
        router.push('/my-properties');
        return;
      }

      setProperty(propertyData);

      // Pre-fill form data
      setFormData({
        title: propertyData.title || '',
        description: propertyData.description || '',
        propertyType: propertyData.propertyType || 'APARTMENT',
        listingType: propertyData.listingType || 'SALE',
        price: propertyData.price?.toString() || '',
        deposit: propertyData.deposit?.toString() || '',
        bedrooms: propertyData.bedrooms?.toString() || '',
        bathrooms: propertyData.bathrooms?.toString() || '',
        areaSqft: propertyData.areaSqft?.toString() || '',
        furnishing: propertyData.furnishing || 'UNFURNISHED',
        address: propertyData.address || '',
        city: propertyData.city || '',
        state: propertyData.state || '',
        pincode: propertyData.pincode || '',
        latitude: propertyData.latitude?.toString() || '',
        longitude: propertyData.longitude?.toString() || '',
        availableFrom: propertyData.availableFrom
          ? new Date(propertyData.availableFrom).toISOString().split('T')[0]
          : '',
      });

      // Pre-fill images
      if (propertyData.images && propertyData.images.length > 0) {
        setImages(propertyData.images.map((img: any) => img.imageUrl));
      }

      // Pre-fill amenities
      if (propertyData.amenities && propertyData.amenities.length > 0) {
        setSelectedAmenities(propertyData.amenities.map((a: any) => a.name));
      }
    } catch (error) {
      console.error('Failed to fetch property:', error);
      alert('Failed to load property details');
      router.push('/my-properties');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const addImageField = () => {
    setImages([...images, '']);
  };

  const removeImageField = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages.length > 0 ? newImages : ['']);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || Number(formData.price) <= 0)
      newErrors.price = 'Valid price is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';

    // Validate images - at least one valid URL
    const validImages = images.filter((img) => img.trim() !== '');
    if (validImages.length === 0) {
      newErrors.images = 'At least one image URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Prepare data
      const propertyData = {
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        price: Number(formData.price),
        deposit: formData.deposit ? Number(formData.deposit) : undefined,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
        areaSqft: formData.areaSqft ? Number(formData.areaSqft) : undefined,
        furnishing: formData.furnishing,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
        availableFrom: formData.availableFrom || undefined,
        images: images.filter((img) => img.trim() !== ''),
        amenities: selectedAmenities,
      };

      await propertiesAPI.update(propertyId, propertyData);

      // Redirect to the property detail page
      router.push(`/properties/${propertyId}`);
    } catch (error: any) {
      console.error('Failed to update property:', error);
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Failed to update property. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200"></div>
          <div className="mt-6 h-96 animate-pulse rounded-lg bg-white shadow"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
          <p className="mt-2 text-gray-600">
            Update your property listing details
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  } focus:border-blue-500 focus:outline-none`}
                  placeholder="e.g., Spacious 3BHK Apartment in Downtown"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  } focus:border-blue-500 focus:outline-none`}
                  placeholder="Describe your property in detail..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Property Type *
                  </label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Listing Type *
                  </label>
                  <select
                    name="listingType"
                    value={formData.listingType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    {LISTING_TYPES.map((type) => (
                      <option key={type} value={type}>
                        For {type.charAt(0) + type.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Pricing</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  } focus:border-blue-500 focus:outline-none`}
                  placeholder="5000000"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                )}
              </div>

              {formData.listingType === 'RENT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="50000"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Property Details */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Property Details
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bedrooms
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bathrooms
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Area (sqft)
                </label>
                <input
                  type="number"
                  name="areaSqft"
                  value={formData.areaSqft}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="1500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Furnishing
                </label>
                <select
                  name="furnishing"
                  value={formData.furnishing}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  {FURNISHING_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.split('_').join(' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Available From
              </label>
              <input
                type="date"
                name="availableFrom"
                value={formData.availableFrom}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none sm:w-64"
              />
            </div>
          </div>

          {/* Location */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Location</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  } focus:border-blue-500 focus:outline-none`}
                  placeholder="123 Main Street, Sector 5"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    } focus:border-blue-500 focus:outline-none`}
                    placeholder="Mumbai"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    } focus:border-blue-500 focus:outline-none`}
                    placeholder="Maharashtra"
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-500">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 ${
                      errors.pincode ? 'border-red-500' : 'border-gray-300'
                    } focus:border-blue-500 focus:outline-none`}
                    placeholder="400001"
                  />
                  {errors.pincode && (
                    <p className="mt-1 text-sm text-red-500">{errors.pincode}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Latitude (optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="19.0760"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Longitude (optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="72.8777"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Property Images
            </h2>

            <div className="space-y-3">
              {images.map((image, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    className="block flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="rounded-md border border-red-300 px-3 py-2 text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {errors.images && (
              <p className="mt-1 text-sm text-red-500">{errors.images}</p>
            )}

            <button
              type="button"
              onClick={addImageField}
              className="mt-3 rounded-md border border-blue-300 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              + Add Another Image
            </button>

            <p className="mt-2 text-sm text-gray-500">
              Enter image URLs. First image will be the cover image.
            </p>
          </div>

          {/* Amenities */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Amenities</h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {COMMON_AMENITIES.map((amenity) => (
                <label
                  key={amenity}
                  className="flex cursor-pointer items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-md bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 sm:flex-none sm:px-8"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/properties/${propertyId}`)}
              className="rounded-md border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
