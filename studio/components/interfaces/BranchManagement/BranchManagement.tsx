import { partition } from 'lodash'
import { useRouter } from 'next/router'
import { useState } from 'react'
import {
  AlertDescription_Shadcn_,
  AlertTitle_Shadcn_,
  Alert_Shadcn_,
  Button,
  IconAlertTriangle,
  IconSearch,
  Input,
  Modal,
} from 'ui'

import { useParams } from 'common'
import { ScaffoldContainer, ScaffoldSection } from 'components/layouts/Scaffold'
import AlertError from 'components/ui/AlertError'
import TextConfirmModal from 'components/ui/Modals/TextConfirmModal'
import { GenericSkeletonLoader } from 'components/ui/ShimmeringLoader'
import { useBranchDeleteMutation } from 'data/branches/branch-delete-mutation'
import { Branch, useBranchesQuery } from 'data/branches/branches-query'
import { useSelectedProject, useStore } from 'hooks'
import { MainBranchPanel } from './BranchPanels'
import CreateBranchSidePanel from './CreateBranchSidePanel'
import PreviewBranches from './PreviewBranches'
import PullRequests from './PullRequests'
import ConfirmationModal from 'components/ui/ConfirmationModal'
import { useBranchesDisableMutation } from 'data/branches/branches-disable-mutation'

const BranchManagement = () => {
  const { ui } = useStore()
  const router = useRouter()
  const { ref } = useParams()
  const projectDetails = useSelectedProject()

  const isBranch = projectDetails?.parent_project_ref !== undefined
  const hasBranchEnabled = projectDetails?.has_branch_enabled
  const projectRef =
    projectDetails !== undefined ? (isBranch ? projectDetails.parent_project_ref : ref) : undefined

  const [showCreateBranch, setShowCreateBranch] = useState(false)
  const [showDisableBranching, setShowDisableBranching] = useState(false)
  const [selectedBranchToDelete, setSelectedBranchToDelete] = useState<Branch>()

  const { data: branches, error, isLoading, isError, isSuccess } = useBranchesQuery({ projectRef })
  const [[mainBranch], previewBranches] = partition(branches, (branch) => branch.is_default)

  const { mutate: deleteBranch, isLoading: isDeleting } = useBranchDeleteMutation({
    onSuccess: () => {
      if (selectedBranchToDelete?.project_ref === ref) {
        ui.setNotification({
          category: 'success',
          message:
            'Successfully deleted branch. You are now currently on the main branch of your project.',
        })
        router.push(`/project/${projectRef}/branches`)
      } else {
        ui.setNotification({ category: 'success', message: 'Successfully deleted branch' })
      }
      setSelectedBranchToDelete(undefined)
    },
  })

  const { mutate: disableBranching, isLoading: isDisabling } = useBranchesDisableMutation({
    onSuccess: () => {
      ui.setNotification({
        category: 'success',
        message: 'Successfully disabled branching for project',
      })
      setShowDisableBranching(false)
    },
  })

  const onConfirmDeleteBranch = () => {
    if (selectedBranchToDelete == undefined) return console.error('No branch selected')
    if (projectRef == undefined) return console.error('Project ref is required')
    deleteBranch({ id: selectedBranchToDelete?.id, projectRef })
  }

  const onConfirmDisableBranching = () => {
    if (projectRef == undefined) return console.error('Project ref is required')
    if (!previewBranches) return console.error('No branches available')
    disableBranching({ projectRef, branchIds: previewBranches?.map((branch) => branch.id) })
  }

  if (!hasBranchEnabled) {
    // [Joshen] Some empty state here
    return <div>Some disabled state</div>
  }

  return (
    <>
      <ScaffoldContainer>
        <ScaffoldSection>
          <div className="col-span-12">
            <h3 className="text-xl mb-8">Branch Manager</h3>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Input placeholder="Search branch" size="small" icon={<IconSearch />} />
              </div>
              <Button onClick={() => setShowCreateBranch(true)}>Create preview branch</Button>
            </div>
            <div className="">
              {isLoading && <GenericSkeletonLoader />}
              {isError && <AlertError error={error} subject="Failed to retrieve branches" />}
              {isSuccess && mainBranch !== undefined && (
                <>
                  <MainBranchPanel
                    branch={mainBranch}
                    onSelectDisableBranching={() => setShowDisableBranching(true)}
                  />
                  <PullRequests previewBranches={previewBranches} />
                  <PreviewBranches
                    previewBranches={previewBranches}
                    onSelectDeleteBranch={setSelectedBranchToDelete}
                  />
                </>
              )}
            </div>
          </div>
        </ScaffoldSection>
      </ScaffoldContainer>

      <TextConfirmModal
        size="medium"
        visible={selectedBranchToDelete !== undefined}
        onCancel={() => setSelectedBranchToDelete(undefined)}
        onConfirm={() => onConfirmDeleteBranch()}
        loading={isDeleting}
        title="Delete branch"
        confirmLabel="Delete branch"
        confirmPlaceholder="Type in name of branch"
        confirmString={selectedBranchToDelete?.name ?? ''}
        text={`This will delete your database preview branch "${selectedBranchToDelete?.name}"`}
        alert="You cannot recover this branch once it is deleted!"
      />

      <ConfirmationModal
        danger
        size="medium"
        loading={isDisabling}
        visible={showDisableBranching}
        header="Confirm disable branching for project"
        buttonLabel="Confirm disable branching"
        buttonLoadingLabel="Disabling branching..."
        onSelectConfirm={() => onConfirmDisableBranching()}
        onSelectCancel={() => setShowDisableBranching(false)}
      >
        <Modal.Content>
          <div className="py-6">
            <Alert_Shadcn_ variant="warning">
              <IconAlertTriangle strokeWidth={2} />
              <AlertTitle_Shadcn_>This action cannot be undone</AlertTitle_Shadcn_>
              <AlertDescription_Shadcn_>
                All database preview branches will be removed upon disabling branching. You may
                still re-enable branching again thereafter, but your existing preview branches will
                not be restored.
              </AlertDescription_Shadcn_>
            </Alert_Shadcn_>
            <ul className="mt-4 space-y-5">
              <li className="flex gap-3">
                <div>
                  <strong className="text-sm">Before you disable branching, consider:</strong>
                  <ul className="space-y-2 mt-2 text-sm text-light">
                    <li className="list-disc ml-6">
                      Your project no longer requires database previews.
                    </li>
                    <li className="list-disc ml-6">
                      None of your database previews are currently being used in any app.
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </Modal.Content>
      </ConfirmationModal>

      <CreateBranchSidePanel
        visible={showCreateBranch}
        onClose={() => setShowCreateBranch(false)}
      />
    </>
  )
}

export default BranchManagement
