'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';

export default function PetComparison({ pets, onClose }) {
  if (pets.length < 2) {
    return null;
  }

  const ComparisonRow = ({ label, values }) => (
    <tr className="border-b">
      <td className="py-3 px-4 font-medium text-gray-700 bg-gray-50">{label}</td>
      {values.map((value, index) => (
        <td key={index} className="py-3 px-4 text-center">
          {value}
        </td>
      ))}
    </tr>
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compare Pets</DialogTitle>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="py-3 px-4 text-left bg-gray-100">Feature</th>
                {pets.map((pet) => (
                  <th key={pet.id} className="py-3 px-4 bg-gray-100">
                    <div className="space-y-2">
                      <div className="relative w-24 h-24 mx-auto rounded-lg overflow-hidden">
                        {pet.primaryImage ? (
                          <Image
                            src={pet.primaryImage}
                            alt={pet.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gray-200 text-3xl">
                            🐾
                          </div>
                        )}
                      </div>
                      <p className="font-semibold">{pet.name}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <ComparisonRow
                label="Species"
                values={pets.map(p => p.species)}
              />
              <ComparisonRow
                label="Breed"
                values={pets.map(p => p.breed || 'Not specified')}
              />
              <ComparisonRow
                label="Age"
                values={pets.map(p => `${p.age} ${p.ageUnit}`)}
              />
              <ComparisonRow
                label="Gender"
                values={pets.map(p => p.gender)}
              />
              <ComparisonRow
                label="Size"
                values={pets.map(p => p.size || 'Not specified')}
              />
              <ComparisonRow
                label="Weight"
                values={pets.map(p => p.weight ? `${p.weight} kg` : 'Not specified')}
              />
              <ComparisonRow
                label="Location"
                values={pets.map(p => `${p.city}, ${p.state}`)}
              />
              <ComparisonRow
                label="Adoption Fee"
                values={pets.map(p => p.adoptionFee > 0 ? `₹${p.adoptionFee}` : 'Free')}
              />
              <ComparisonRow
                label="Vaccinated"
                values={pets.map(p => p.isVaccinated ? <CheckCircle className="text-green-600 mx-auto" size={20} /> : <XCircle className="text-red-600 mx-auto" size={20} />)}
              />
              <ComparisonRow
                label="Neutered/Spayed"
                values={pets.map(p => (p.isNeutered || p.isSpayed) ? <CheckCircle className="text-green-600 mx-auto" size={20} /> : <XCircle className="text-red-600 mx-auto" size={20} />)}
              />
              <ComparisonRow
                label="House Trained"
                values={pets.map(p => p.houseTrained ? <CheckCircle className="text-green-600 mx-auto" size={20} /> : <XCircle className="text-red-600 mx-auto" size={20} />)}
              />
              <ComparisonRow
                label="Good with Kids"
                values={pets.map(p => p.goodWithKids ? <CheckCircle className="text-green-600 mx-auto" size={20} /> : <XCircle className="text-red-600 mx-auto" size={20} />)}
              />
              <ComparisonRow
                label="Good with Pets"
                values={pets.map(p => p.goodWithPets ? <CheckCircle className="text-green-600 mx-auto" size={20} /> : <XCircle className="text-red-600 mx-auto" size={20} />)}
              />
              <ComparisonRow
                label="Energy Level"
                values={pets.map(p => p.energyLevel || 'Not specified')}
              />
              <ComparisonRow
                label="Status"
                values={pets.map(p => (
                  <Badge variant={p.adoptionStatus === 'available' ? 'success' : 'secondary'}>
                    {p.adoptionStatus}
                  </Badge>
                ))}
              />
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
