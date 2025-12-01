import React, { useState, useMemo, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import DeleteConfirmationModal from './DeleteConfirmationModal';

// UI Components
import { Separator } from '@/components/ui/separator';

// Asset Imports
import MoreOptionsIcon from '../../assets/icons/comments more options.svg';
import ReplyIcon from '../../assets/icons/comments reply.svg';
import EditIcon from '../../assets/icons/edit.svg';
import DeleteIcon from '../../assets/icons/delete-comment.svg';
import NoCommentIcon from '../../assets/icons/No-comment.svg';
import person1 from '../../assets/icons/person_1.svg';
import person2 from '../../assets/icons/person_2.svg';
import person3 from '../../assets/icons/person_3.svg';
import person4 from '../../assets/icons/person_4.svg';
import person5 from '../../assets/icons/person_5.svg';

const userAvatarMap: { [key: string]: string } = {
  'Kiran Patel': person1,
  'Nisha Sharma': person2,
  'Ravi Kumar': person3,
  'Sita Rani': person4,
  'Vikram Singh': person5,
  'You': person1,
};

interface CommentsPanelProps {
  documentId?: string;
}

interface Comment {
  id: string;
  user: string;
  content: string;
  timestamp: string;
  isEdited?: boolean;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({ documentId }) => {
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [newComment, setNewComment] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');

  const [comments, setComments] = useState<Comment[]>([
    { id: '1', user: 'Kiran Patel', content: 'The Invoice For March Is Yet To Arrive. Please Consult The Finance Team Regarding This.', timestamp: '2025-07-25T15:30:00Z' },
    { id: '2', user: 'Nisha Sharma', content: "The Invoice For March Hasn't Been Received Yet. Could You Please Follow Up With The Finance Department?", timestamp: '2025-07-24T10:00:00Z' },
    { id: '3', user: 'Ravi Kumar', content: "We're Still Waiting On The March Invoice. Please Reach Out To The Finance Team For An Update.", timestamp: '2025-07-23T20:45:00Z' },
    { id: '4', user: 'Sita Rani', content: 'The March Invoice Is Still Outstanding. Can You Check In With The Finance Team?', timestamp: '2025-07-23T19:45:00Z' },
    { id: '5', user: 'Vikram Singh', content: 'It Appears The March Invoice Is Missing. Please Verify With The Finance Team.', timestamp: '2025-07-22T19:45:00Z' }
  ]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    return date.toLocaleDateString('en-GB', options);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: uuidv4(),
        user: 'You',
        content: newComment,
        timestamp: new Date().toISOString()
      };
      const newComments = sortOrder === 'latest' ? [comment, ...comments] : [...comments, comment];
      setComments(newComments);
      setNewComment('');
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
    setOpenMenuId(null);
  };

  const handleSaveComment = (id: string) => {
    setComments(comments.map(comment =>
      comment.id === id ? { ...comment, content: editingCommentContent, isEdited: true } : comment
    ));
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const handleDeleteComment = (id: string) => {
    setCommentToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (commentToDelete) {
      setComments(comments.filter(comment => comment.id !== commentToDelete));
      setShowDeleteModal(false);
      setCommentToDelete(null);
    }
  };

  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });
  }, [comments, sortOrder]);

  return (
    <div className="flex flex-col h-full w-full px-5">
      {/* HEADER */}
      <div className="w-full py-3">
        <div className="flex justify-between items-center ">
          <h2 className="text-[#192839] font-[Noto_Sans] text-[18px] not-italic font-bold leading-normal capitalize">
            Comment
          </h2>
          <select
            className="text-gray-600 bg-white text-sm outline-none"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'latest' | 'oldest')}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* LIST AREA */}
      <div className="flex-1 flex flex-col min-h-0">
        <Separator className="-mx-5 w-[calc(100%+2.5rem)] h-px bg-gray-200" />
        <div className="flex-1 space-y-6 pt-3 overflow-y-auto custom-scroll scrollbar-hide">
          {sortedComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <img src={NoCommentIcon} alt="No comments" className="w-24 h-24 mb-4" />
              <p className="self-stretch text-[var(--neutral-light-for-white-bg-neutral-1200, #192839)] text-center font-[Noto_Sans] text-base font-semibold leading-6">No comments yet</p>
              <p className="self-stretch text-[#40566D] text-center font-[Noto_Sans] text-[13px] font-normal leading-[18px]">Start the conversation by adding your thoughts or feedback.</p>
            </div>
          ) : (
            sortedComments.map((comment) => (
              // 1. This is the main container
              <div key={comment.id} className="space-y-1">

              {/* 2. This is the new header with vertical centering */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={userAvatarMap[comment.user] || person1}
                      alt={comment.user}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#192839]">
                      {comment.user}
                    </p>
                    <p className="text-[12px] text-[#58728D] mt-0.5">
                      {comment.isEdited && <span className="text-xs"> Edited • </span>} {formatDate(comment.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <button className='p-1'>
                      <img src={ReplyIcon} alt="Reply" className="w-6 h-6 cursor-pointer" />
                    </button>
                  <div className="relative">
                    <button className='p-1' onClick={() => setOpenMenuId(openMenuId === comment.id ? null : comment.id)}>
                      <img src={MoreOptionsIcon} alt="Options" className="w-6 h-6 cursor-pointer" />
                    </button>
                    {openMenuId === comment.id && (
                      <div className="absolute right-[0px] top-[25px] w-[107px] rounded-lg bg-white shadow-lg z-10">
                        <ul className="flex w-full flex-col items-start py-2">
                          <li className="self-stretch">
                            <button onClick={() => handleEditComment(comment)} className="flex items-center self-stretch gap-2 px-4 py-2 text-sm font-normal font-[Noto_Sans] leading-5 text-[#192839] hover:bg-gray-100 w-full">
                              <img src={EditIcon} alt="Edit" className="w-4 h-4" />
                              Edit
                            </button>
                          </li>
                          <li className="self-stretch">
                            <button onClick={() => handleDeleteComment(comment.id)} className="flex items-center self-stretch gap-2 px-4 py-2 text-sm font-normal font-[Noto_Sans] leading-5 text-[#192839] hover:bg-gray-100 w-full">
                              <img src={DeleteIcon} alt="Delete" className="w-4 h-4" />
                              Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. This is the comment body, now separate and correctly indented */}
              {editingCommentId === comment.id ? (
                <div className="py-2 px-3 rounded-lg border border-[rgba(48,94,255,0.18)] bg-[#FFFFFF]">
                  <div className="flex flex-col w-full+">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={userAvatarMap[comment.user] || person1}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <input
                        ref={input => input && input.focus()}
                        type="text"
                        value={editingCommentContent}
                        onChange={(e) => setEditingCommentContent(e.target.value)}
                        className="flex-1 ml-3 h-8 text-sm bg-transparent text-[#192839] placeholder-gray-500 focus:outline-none font-medium capitalize"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveComment(comment.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">Use @ for mention people</span>
                      <button
                        onClick={() => handleSaveComment(comment.id)}
                        className="text-[#6B7280] hover:text-[#2950DA] disabled:opacity-50 p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M1.34016 14L15.3335 8L1.34016 2L1.3335 6.66667L11.3335 8L1.3335 9.33333L1.34016 14Z" fill="#666666"/>
                      </svg>
                      </button>
                    </div>
                  </div>
                  <div className="text-[10px] text-[#768EA7] font-medium mt-1 w-[283px] h-[14px]">
                    escape to <button onClick={handleCancelEdit} className="text-[#192839] font-bold">cancel</button> • enter to <button onClick={() => handleSaveComment(comment.id)} className="text-[#192839] font-bold">save</button>
                  </div>
                </div>
              ) : (
                <p className="text-[#243547] text-[12px] font-medium ml-11">
                  {comment.content}
                </p>
              )}
            </div>
            ))
          )}
        </div>
      </div>

      {/* INPUT FORM */}
      <div className="w-full py-2 ">
      {/* This inner container is the white "check box" with all the new styles */}
      <div className="flex items-center w-full+ rounded-lg bg-white border border-gray-300 py-3 px-2 -mx-3">
        <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
          <img
            src={userAvatarMap['You']}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <input
          type="text"
          placeholder="Write Comment"
          className="flex-1 ml-3 text-sm bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
        />
        <button
          onClick={handleAddComment}
          disabled={!newComment.trim()}
          className="text-[#6B7280] hover:text-[#2950DA] disabled:opacity-50 ml-3"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.4 20.4L20.85 12.02L3.4 3.6V10.29L15.35 12.02L3.4 13.75V20.4Z"
              fill="#58728D"
            />
          </svg>
        </button>
      </div>
    </div>
    {showDeleteModal && (
      <DeleteConfirmationModal
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    )}
    </div>
  );
};

export default CommentsPanel;
