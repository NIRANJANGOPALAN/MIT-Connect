'use client'

import React, { useState, useRef } from 'react'
import { 
  Fab, 
  Paper, 
  Box, 
  Button,
  Tooltip,
  Zoom,
  Slide,
  Typography,
  Divider,
  Menu,
  MenuItem
} from '@mui/material'
import { 
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  AttachFile as AttachFileIcon,
  LinkOff as LinkOffIcon,
  Visibility as VisibilityIcon,
  Chat as ChatIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material'

const ActionButton = ({ icon, label, tooltip, onClick, disabled, component = 'button', endIcon, ...props }) => (
  <Tooltip title={tooltip} placement="top">
    <span>
      <Button
        variant="contained"
        color="primary"
        startIcon={icon}
        endIcon={endIcon}
        onClick={onClick}
        disabled={disabled}
        component={component}
        sx={{
          minWidth: '140px',
          justifyContent: 'flex-start',
          textTransform: 'none',
          px: 2,
          py: 1,
        }}
        {...props}
      >
        {label}
      </Button>
    </span>
  </Tooltip>
)

export default function FileUpload({ onFileSelect }) {
  const [isOpen, setIsOpen] = useState(false)
  const [connectedFile, setConnectedFile] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const fileInputRef = useRef(null)

  const togglePanel = () => setIsOpen(!isOpen)

  const handleFileConnect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setConnectedFile(file)
      console.log("File selected:", file)
      onFileSelect(file)
    }
  }

  const handleDisconnect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setConnectedFile(null)
    console.log("File disconnected")
    onFileSelect(null)
  }

  const handleVisualize = () => {
    console.log('Visualize functionality to be implemented')
  }

  const handleAskAI = () => {
    console.log('Ask AI functionality to be implemented')
  }

  const handleFileTypeMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleFileTypeMenuClose = () => {
    setAnchorEl(null)
  }

  const handleFileTypeSelect = (fileType) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = fileType
      fileInputRef.current.click()
    }
    handleFileTypeMenuClose()
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        display: 'flex',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <Fab
        color="primary"
        aria-label="expand"
        onClick={togglePanel}
        sx={{
          zIndex: 1001,
          boxShadow: 3,
          width: 64,
          height: 64,
        }}
      >
        {isOpen ? <ChevronLeftIcon sx={{ fontSize: 32 }} /> : <ChevronRightIcon sx={{ fontSize: 32 }} />}
      </Fab>
      <Slide direction="right" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={6}
          sx={{
            display: 'flex',
            alignItems: 'center',
            ml: 2,
            p: 2,
            borderRadius: 4,
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Zoom in={isOpen} style={{ transitionDelay: isOpen ? '100ms' : '0ms' }}>
              <span>
                <input
                  style={{ display: 'none' }}
                  id="connect-file"
                  type="file"
                  onChange={handleFileConnect}
                  ref={fileInputRef}
                />
                <ActionButton
                  icon={<AttachFileIcon />}
                  label="Connect File"
                  tooltip="Connect a file"
                  onClick={handleFileTypeMenuOpen}
                  endIcon={<ArrowDropDownIcon />}
                />
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleFileTypeMenuClose}
                >
                  <MenuItem onClick={() => handleFileTypeSelect('.csv, .xls, .xlsx')}>CSV/Excel</MenuItem>
                  {/* <MenuItem onClick={() => handleFileTypeSelect('.txt')}>Text</MenuItem>
                  <MenuItem onClick={() => handleFileTypeSelect('.json')}>JSON</MenuItem> */}
                </Menu>
              </span>
            </Zoom>
            {connectedFile && (
              <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                <Typography variant="body2" sx={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {connectedFile.name}
                </Typography>
              </Zoom>
            )}
            <Divider orientation="vertical" flexItem />
            <Zoom in={isOpen} style={{ transitionDelay: isOpen ? '200ms' : '0ms' }}>
              <span>
                <ActionButton
                  icon={<LinkOffIcon />}
                  label="Disconnect"
                  tooltip="Disconnect the file"
                  onClick={handleDisconnect}
                  disabled={!connectedFile}
                />
              </span>
            </Zoom>
            <Zoom in={isOpen} style={{ transitionDelay: isOpen ? '300ms' : '0ms' }}>
              <span>
                <ActionButton
                  icon={<VisibilityIcon />}
                  label="Visualize"
                  tooltip="Visualize the file"
                  onClick={handleVisualize}
                  disabled={!connectedFile}
                />
              </span>
            </Zoom>
            <Zoom in={isOpen} style={{ transitionDelay: isOpen ? '400ms' : '0ms' }}>
              <span>
                <ActionButton
                  icon={<ChatIcon />}
                  label="Ask AI"
                  tooltip="Ask AI about the file"
                  onClick={handleAskAI}
                  disabled={!connectedFile}
                />
              </span>
            </Zoom>
          </Box>
        </Paper>
      </Slide>
    </Box>
  )
}