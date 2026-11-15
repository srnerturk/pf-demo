import { CircleAlertIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ImageFileField } from '@/shared/components/ImageFileField'
import { PhoneField } from '@/shared/components/PhoneField'
import { SelectField } from '@/shared/components/SelectField'
import { SubmitButton } from '@/shared/components/SubmitButton'
import { TextField } from '@/shared/components/TextField'
import type { MessageKey } from '@/shared/i18n/catalog'
import { useI18n } from '@/shared/i18n/useI18n'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { EmailAlreadyInUseError, InvalidNewUserError, type CreateUser, type CreateUserCommand } from '../application/create-user'
import type { ListUserGroups } from '../application/list-user-groups'
import {
  PROFILE_PHOTO_MAX_BYTES,
  PROFILE_PHOTO_MEDIA_TYPES,
  validateEmail,
  validatePhone,
  validateProfilePhoto,
  validateRequired,
  type NewUserViolation,
  type PhoneNumber,
} from '../domain/new-user'
import type { User, UserGroup, UserLanguage } from '../domain/user'
import { countryCodes } from './country-codes'

interface CreateUserFormValues {
  language: UserLanguage
  firstName: string
  lastName: string
  email: string
  phone: PhoneNumber
  userGroupId: string
  profilePhoto: File | null
}

const VIOLATION_MESSAGES: Record<NewUserViolation, MessageKey> = {
  required: 'users.create.violations.required',
  'invalid-email': 'users.create.violations.invalidEmail',
  'invalid-phone': 'users.create.violations.invalidPhone',
  'unsupported-photo-type': 'users.create.violations.unsupportedPhotoType',
  'photo-too-large': 'users.create.violations.photoTooLarge',
}

const PHOTO_MAX_KB = PROFILE_PHOTO_MAX_BYTES / 1024
const LANGUAGES: readonly UserLanguage[] = ['tr', 'en']

interface CreateUserDialogProps {
  open: boolean
  onOpenChange(open: boolean): void
  createUser: CreateUser
  listUserGroups: ListUserGroups
  onCreated(user: User): void
}

/** The create-user form in a modal. Each opening starts with an empty form. */
export function CreateUserDialog({ open, onOpenChange, createUser, listUserGroups, onCreated }: CreateUserDialogProps) {
  const { t } = useI18n()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={t('common.close')} className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('users.create.title')}</DialogTitle>
          <DialogDescription>{t('users.create.description')}</DialogDescription>
        </DialogHeader>
        <CreateUserForm createUser={createUser} listUserGroups={listUserGroups} onCreated={onCreated} />
      </DialogContent>
    </Dialog>
  )
}

type CreateUserFormProps = Pick<CreateUserDialogProps, 'createUser' | 'listUserGroups' | 'onCreated'>

function CreateUserForm({ createUser, listUserGroups, onCreated }: CreateUserFormProps) {
  const { t, locale } = useI18n()
  const userGroups = useUserGroups(listUserGroups)
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    defaultValues: {
      language: locale,
      firstName: '',
      lastName: '',
      email: '',
      phone: { countryCode: countryCodes[0].code, nationalNumber: '' },
      userGroupId: '',
      profilePhoto: null,
    },
    mode: 'onTouched',
  })

  const message = (violation: NewUserViolation) => t(VIOLATION_MESSAGES[violation], { maxKb: PHOTO_MAX_KB })
  /** Adapts a domain rule to React Hook Form's `validate`: `true` when valid, otherwise the message to show. */
  const ruleFor =
    <Value,>(rule: (value: Value) => NewUserViolation | null) =>
    (value: Value) => {
      const violation = rule(value)
      return violation === null ? true : message(violation)
    }

  const onSubmit = handleSubmit(async (values) => {
    try {
      onCreated(await createUser(toCommand(values)))
    } catch (error) {
      if (error instanceof EmailAlreadyInUseError) {
        setError('email', { message: t('users.create.violations.emailInUse') }, { shouldFocus: true })
      } else if (error instanceof InvalidNewUserError) {
        for (const [field, violation] of Object.entries(error.violations)) {
          setError(field as keyof CreateUserFormValues, { message: message(violation) })
        }
      } else {
        setError('root.createFailure', { message: t('users.create.failed') })
      }
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="new-user-first-name" label={t('users.create.firstName')} autoComplete="off" error={errors.firstName?.message} {...register('firstName', { validate: ruleFor(validateRequired) })} />
        <TextField id="new-user-last-name" label={t('users.create.lastName')} autoComplete="off" error={errors.lastName?.message} {...register('lastName', { validate: ruleFor(validateRequired) })} />
      </div>

      <TextField
        id="new-user-email"
        label={t('users.create.email')}
        type="email"
        autoComplete="off"
        placeholder={t('users.create.emailPlaceholder')}
        error={errors.email?.message}
        {...register('email', { validate: ruleFor(validateEmail) })}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Controller
          control={control}
          name="userGroupId"
          rules={{ validate: ruleFor(validateRequired) }}
          render={({ field }) => (
            <SelectField
              id="new-user-group"
              label={t('users.create.userGroup')}
              placeholder={t('users.create.userGroupPlaceholder')}
              options={userGroups.map((group) => ({ value: group.id, label: group.name }))}
              value={field.value}
              onValueChange={field.onChange}
              error={errors.userGroupId?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="language"
          render={({ field }) => (
            <SelectField
              id="new-user-language"
              label={t('users.create.language')}
              options={LANGUAGES.map((language) => ({ value: language, label: t(`locales.${language}`) }))}
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />
      </div>

      <Controller
        control={control}
        name="phone"
        rules={{ validate: ruleFor(validatePhone) }}
        render={({ field }) => (
          <PhoneField
            id="new-user-phone"
            label={t('users.create.phoneOptional')}
            countryCodes={countryCodes}
            placeholder={t('users.create.phonePlaceholder')}
            value={field.value}
            onChange={field.onChange}
            error={errors.phone?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="profilePhoto"
        rules={{ validate: ruleFor((file: File | null) => validateProfilePhoto(file && { mediaType: file.type, sizeBytes: file.size })) }}
        render={({ field }) => (
          <ImageFileField
            id="new-user-photo"
            label={t('users.create.photo')}
            accept={PROFILE_PHOTO_MEDIA_TYPES.join(',')}
            hint={t('users.create.photoHint', { maxKb: PHOTO_MAX_KB })}
            value={field.value}
            onChange={field.onChange}
            error={errors.profilePhoto?.message}
          />
        )}
      />

      {errors.root?.createFailure && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertDescription>{errors.root.createFailure.message}</AlertDescription>
        </Alert>
      )}

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            {t('common.cancel')}
          </Button>
        </DialogClose>
        <SubmitButton pending={isSubmitting} pendingLabel={t('common.saving')}>
          {t('common.save')}
        </SubmitButton>
      </DialogFooter>
    </form>
  )
}

function toCommand({ profilePhoto, ...values }: CreateUserFormValues): CreateUserCommand {
  return {
    ...values,
    profilePhoto: profilePhoto && { mediaType: profilePhoto.type, sizeBytes: profilePhoto.size, content: profilePhoto },
  }
}

/** The groups a new user can join, loaded once when the form opens. */
function useUserGroups(listUserGroups: ListUserGroups): UserGroup[] {
  const [groups, setGroups] = useState<UserGroup[]>([])

  useEffect(() => {
    let current = true
    listUserGroups().then(
      (loaded) => current && setGroups(loaded),
      () => current && setGroups([]),
    )
    return () => {
      current = false
    }
  }, [listUserGroups])

  return groups
}
