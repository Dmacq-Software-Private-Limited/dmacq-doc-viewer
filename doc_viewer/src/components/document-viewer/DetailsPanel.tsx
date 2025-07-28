import React from 'react'
import DetailsPdfIcon from '../../assets/icons/Details pdf icon.svg'
import DetailsFolderIcon from '../../assets/icons/Details folder.svg'
import DetailsSizeIcon from '../../assets/icons/Details -size.svg'
import DetailsCalendarIcon from '../../assets/icons/Details-calendar.svg'
import DetailsLastModifiedIcon from '../../assets/icons/Details- lastmodified.svg'
import DetailsMasterIcon from '../../assets/icons/Blobs icon.svg'
import DetailsDocTypeIcon from '../../assets/icons/Blobs icon.svg'
import person1 from '../../assets/icons/person_1.svg'
import person2 from '../../assets/icons/person_2.svg'
import person3 from '../../assets/icons/person_3.svg'
import person4 from '../../assets/icons/person_4.svg'
import person5 from '../../assets/icons/person_5.svg'
import { Separator } from '@/components/ui/separator';

interface DetailsPanelProps {
  document: {
    name: string
    fileType: string
    size: string
    location: string
    createdBy: string
    uploadedAt: string
    lastModified: string
    masterConnected: string
    docTypeConnected: string
  }
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({ document }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const rows = [
    { icon: DetailsPdfIcon, label: 'File Type', value: document.fileType },
    { icon: DetailsFolderIcon, label: 'Location', value: document.location },
    { icon: DetailsSizeIcon, label: 'Size', value: document.size },
    { icon: DetailsCalendarIcon, label: 'Created By', value: formatDate(document.uploadedAt) },
    { icon: DetailsLastModifiedIcon, label: 'Last Modified At', value: formatDate(document.lastModified) },
    {
      icon: DetailsMasterIcon,
      label: 'Master Connected',
      value: (
        <>
          {document.masterConnected}, <span className="text-blue-600 cursor-pointer">+7 Master</span>
        </>
      )
    },
    {
      icon: DetailsDocTypeIcon,
      label: 'DocType Connected',
      value: (
        <>
          {document.docTypeConnected}, <span className="text-blue-600 cursor-pointer">+7 DocType</span>
        </>
      )
    }
  ]

  const users = [
    { id: 1, avatar: person1 },
    { id: 2, avatar: person2 },
    { id: 3, avatar: person3 },
    { id: 4, avatar: person4 },
    { id: 5, avatar: person5 }
  ]

  return (
    <div className="w-full">
      <style>{`
        .details-label {
          color: #40566D;
          font-family: 'Noto Sans', sans-serif;
          font-size: 13px;
          font-weight: 400;
          text-transform: capitalize;
        }
        .details-value {
          color: #192839;
          font-family: 'Noto Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          text-transform: capitalize;
        }
      `}</style>

      <div className="py-3">
        <h3 className="text-[#192839] font-[Noto_Sans] text-[18px] not-italic font-bold leading-normal capitalize ">Details</h3>
        <Separator className="-mx-5 w-[calc(100%+2.5rem)] h-px bg-gray-200 mt-3" />
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          {rows.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-[#F5F7FA] rounded flex-shrink-0">
                <img src={item.icon} alt={item.label} className="w-5 h-5" />
              </div>
              <div className="text-sm min-w-0 flex-1">
                <p className="details-label">{item.label}</p>
                <p className="details-value mt-0.5 break-words">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600 mb-3">Who Has Accessed</p>
          <div className="flex justify-between items-center">
            <div className="flex -space-x-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="w-8 h-8 sm:w-6 sm:h-6 rounded-full overflow-hidden border-2 border-white flex-shrink-0"
                >
                  <img
                    src={u.avatar}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <span className="text-sm text-blue-600 cursor-pointer flex-shrink-0">View All</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailsPanel