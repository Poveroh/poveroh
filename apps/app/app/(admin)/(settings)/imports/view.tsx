'use client'

import { useTranslations } from 'next-intl'

import { Upload } from 'lucide-react'

import { useImport } from '@/hooks/use-imports'
import Box from '@/components/box/box-wrapper'
import { ImportsItem } from '@/components/item/imports-item'
import { ImportDrawer } from '@/components/drawer/import-drawer'
import { Header } from '@/components/other/header-page'
import { useDrawer } from '@/hooks/use-drawer'
import { useDeleteModal } from '@/hooks/use-delete-modal'
import { PageWrapper } from '@/components/box/page-wrapper'
import { ImportData } from '@poveroh/types'
import { useModal } from '@/hooks/use-modal'
import { ConfirmModal } from '@/components/modal/confirm-modal'
import { MODAL_IDS } from '@/types/constant'

export default function ImportsView() {
    const t = useTranslations()

    const { importData, importQuery, createImport, deleteAllMutation, rollbackImport } = useImport()

    const { openDrawer } = useDrawer<ImportData>()
    const { openModal: openDeleteModal } = useDeleteModal<ImportData>()
    const rollbackManager = useModal<ImportData>(MODAL_IDS.IMPORT_ROLLBACK_CONFIRM)

    const handleRollbackImport = async () => {
        if (!rollbackManager.item) return

        rollbackManager.setLoading(true)

        await rollbackImport.mutateAsync({ path: { id: rollbackManager.item.id } })

        rollbackManager.setLoading(false)
        rollbackManager.closeModal()
    }

    return (
        <>
            <PageWrapper>
                <Header
                    title={t('imports.title')}
                    titleSize='compact'
                    breadcrumbs={[
                        { label: t('settings.title'), href: '/settings' },
                        { label: t('settings.manage.title'), href: '/settings' },
                        { label: t('imports.title') }
                    ]}
                    fetchAction={{
                        onClick: () => importQuery.refetch,
                        loading: importQuery.isFetching
                    }}
                    addAction={{
                        onClick: () => openDrawer('create'),
                        loading: createImport.isPending
                    }}
                    onDeleteAll={{
                        onClick: openDeleteModal,
                        loading: deleteAllMutation.isPending
                    }}
                />

                {importData.length > 0 ? (
                    <Box>
                        {importData.map(imports => (
                            <ImportsItem
                                key={imports.id}
                                imports={imports}
                                openEdit={(x: ImportData) => openDrawer('edit', x)}
                                openDelete={x => openDeleteModal(x)}
                                onRollback={x => rollbackManager.openModal('confirm', x)}
                            />
                        ))}
                    </Box>
                ) : (
                    <div className='flex justify-center w-full pt-20'>
                        <div className='flex flex-col items-center space-y-8 justify-center w-[400px]'>
                            <div className='flex flex-col items-center space-y-8 justify-center'>
                                <Upload />
                                <div className='flex flex-col items-center space-y-2 justify-center'>
                                    <h4>{t('imports.empty.title')}</h4>
                                    <p>{t('imports.empty.subtitle')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </PageWrapper>

            <ConfirmModal
                title={t('imports.rollback.dialog.title')}
                description={t('imports.rollback.dialog.description')}
                loading={rollbackManager.loading}
                open={rollbackManager.isOpen}
                closeDialog={rollbackManager.closeModal}
                onConfirm={handleRollbackImport}
                buttonConfirmLabel={t('buttons.rollback')}
            />

            <ImportDrawer></ImportDrawer>
        </>
    )
}
