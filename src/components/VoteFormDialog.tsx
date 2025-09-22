'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FormDialog } from '@/components/shared';
import { Race, Pilot } from '@/lib/firestore';
import { useVoting } from '@/hooks';

interface VoteData {
  pole: string;
  positions: string[];
  crashPilot: string;
}

interface VoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  race: Race | null;
  pilots: Pilot[];
  existingVote?: any;
  onVoteSubmitted: () => void;
}

const VoteFormDialog: React.FC<VoteFormDialogProps> = ({
  open,
  onOpenChange,
  race,
  pilots,
  existingVote,
  onVoteSubmitted
}) => {
  const { submitVote, submitting, getAvailablePilotsForPositions, isVotingClosed } = useVoting();

  const getAvailablePilots = useCallback((currentField: string, formData: Record<string, any>) => {
    const activePilots = pilots.filter(p => p.active);
    
    const positionFields = [
      'position1', 'position2', 'position3', 'position4', 'position5',
      'position6', 'position7', 'position8', 'position9', 'position10'
    ];
    
    // Para pole position y crash pilot, todos los pilotos están disponibles
    if (!positionFields.includes(currentField)) {
      return activePilots;
    }
    
    // Para posiciones, excluir pilotos ya seleccionados en otras posiciones
    const selectedPilots = positionFields
      .filter(field => field !== currentField)
      .map(field => formData[field])
      .filter(Boolean);
    
    return activePilots.filter(pilot => !selectedPilots.includes(pilot.id));
  }, [pilots]);

  const handleSave = async (data: Record<string, any>) => {
    if (!race || isReadOnly) return;

    const voteData: VoteData = {
      pole: data.pole,
      positions: [
        data.position1, data.position2, data.position3, data.position4, data.position5,
        data.position6, data.position7, data.position8, data.position9, data.position10
      ],
      crashPilot: data.crashPilot
    };

    const success = await submitVote(race.id!, voteData);
    if (success) {
      onVoteSubmitted();
      onOpenChange(false);
    }
  };

  if (!race) return null;

  const votingClosed = isVotingClosed(race);
  const isReadOnly = votingClosed;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={existingVote ? (isReadOnly ? 'Ver Voto' : 'Modificar Voto') : 'Nuevo Voto'}
      description={
        isReadOnly 
          ? 'Visualiza tu voto para esta carrera.'
          : existingVote 
            ? 'Modifica tu voto para esta carrera.'
            : `Realiza tu predicción para ${race.name}.`
      }
      onSubmit={handleSave}
      initialData={{
        pole: existingVote?.pole || '',
        position1: existingVote?.positions?.[0] || '',
        position2: existingVote?.positions?.[1] || '',
        position3: existingVote?.positions?.[2] || '',
        position4: existingVote?.positions?.[3] || '',
        position5: existingVote?.positions?.[4] || '',
        position6: existingVote?.positions?.[5] || '',
        position7: existingVote?.positions?.[6] || '',
        position8: existingVote?.positions?.[7] || '',
        position9: existingVote?.positions?.[8] || '',
        position10: existingVote?.positions?.[9] || '',
        crashPilot: existingVote?.crashPilot || ''
      }}
      loading={submitting}
      submitLabel={existingVote ? 'Actualizar Voto' : 'Registrar Voto'}
      showSubmitButton={!isReadOnly}
      fields={[
        {
          name: 'pole',
          label: 'Pole Position',
          type: 'select-input',
          required: true,
          disabled: isReadOnly,
          pilots: (formData: Record<string, any>) => getAvailablePilots('pole', formData),
          placeholder: 'Seleccionar piloto para pole position...',
        },
        {
          name: 'position1',
          label: 'Posición 1',
          type: 'select-input',
          required: true,
          disabled: isReadOnly,
          pilots: (formData: Record<string, any>) => getAvailablePilots('position1', formData),
          placeholder: 'Seleccionar piloto para posición 1...'
        },
        {
          name: 'position2',
          label: 'Posición 2',
          type: 'select-input',
          required: true,
          disabled: isReadOnly,
          pilots: (formData: Record<string, any>) => getAvailablePilots('position2', formData),
          placeholder: 'Seleccionar piloto para posición 2...'
        },
        {
          name: 'position3',
          label: 'Posición 3',
          type: 'select-input',
          required: true,
          disabled: isReadOnly,
          pilots: (formData: Record<string, any>) => getAvailablePilots('position3', formData),
          placeholder: 'Seleccionar piloto para posición 3...'
        },
        {
          name: 'position4',
          label: 'Posición 4',
          type: 'select-input',
          required: true,
          disabled: isReadOnly,
          pilots: (formData: Record<string, any>) => getAvailablePilots('position4', formData),
          placeholder: 'Seleccionar piloto para posición 4...'
        },
        {
          name: 'position5',
          label: 'Posición 5',
          type: 'select-input',
          required: true,
          disabled: isReadOnly,
          pilots: (formData: Record<string, any>) => getAvailablePilots('position5', formData),
          placeholder: 'Seleccionar piloto para posición 5...'
        },
        {
          name: 'position6',
          label: 'Posición 6',
          type: 'select-input',
          required: true,
          disabled: isReadOnly,
          pilots: (formData: Record<string, any>) => getAvailablePilots('position6', formData),
          placeholder: 'Seleccionar piloto para posición 6...'
        },
        {
          name: 'position7',
          label: 'Posición 7',
          type: 'select-input',
          required: true,
          disabled: isReadOnly,
          pilots: (formData: Record<string, any>) => getAvailablePilots('position7', formData),
          placeholder: 'Seleccionar piloto para posición 7...'
        },
        {
          name: 'position8',
          label: 'Posición 8',
          type: 'select-input',
          required: true,
          disabled: isReadOnly,
          pilots: (formData: Record<string, any>) => getAvailablePilots('position8', formData),
          placeholder: 'Seleccionar piloto para posición 8...'
        },
        {
          name: 'position9',
          label: 'Posición 9',
          type: 'select-input',
          required: true,
          disabled: isReadOnly,
          pilots: (formData: Record<string, any>) => getAvailablePilots('position9', formData),
          placeholder: 'Seleccionar piloto para posición 9...'
        },
        {
          name: 'position10',
          label: 'Posición 10',
          type: 'select-input',
          required: true,
          disabled: isReadOnly,
          pilots: (formData: Record<string, any>) => getAvailablePilots('position10', formData),
          placeholder: 'Seleccionar piloto para posición 10...',
        },
        {
          name: 'crashPilot',
          label: 'Piloto Accidentado',
          type: 'select-input',
          required: true,
          disabled: isReadOnly,
          pilots: (formData: Record<string, any>) => getAvailablePilots('crashPilot', formData),
          placeholder: 'Seleccionar piloto que podría accidentarse...',
        }
      ]}
    />
  );
};

export default VoteFormDialog;