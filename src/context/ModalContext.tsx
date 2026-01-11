import React, { createContext, useContext, useState, useCallback } from 'react';
import AppModal, { ModalButton, ModalProps } from '../components/Modal';

interface ModalContextValue {
  showModal: (props: Omit<ModalProps, 'visible'>) => void;
  hideModal: () => void;
  showSuccess: (message: string, title?: string, onClose?: () => void) => void;
  showError: (message: string, title?: string, onClose?: () => void) => void;
  showInfo: (message: string, title?: string, onClose?: () => void) => void;
  showWarning: (message: string, title?: string, onClose?: () => void) => void;
  showConfirm: (
    message: string,
    onConfirm: () => void,
    title?: string,
    confirmText?: string,
    cancelText?: string
  ) => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalProps, setModalProps] = useState<ModalProps>({
    visible: false,
    message: '',
  });

  const hideModal = useCallback(() => {
    setModalProps((prev) => ({ ...prev, visible: false }));
  }, []);

  const showModal = useCallback((props: Omit<ModalProps, 'visible'>) => {
    setModalProps({
      ...props,
      visible: true,
    });
  }, []);

  const showSuccess = useCallback(
    (message: string, title: string = 'Success', onClose?: () => void) => {
      showModal({
        message,
        title,
        type: 'success',
        onClose: () => {
          hideModal();
          onClose?.();
        },
      });
    },
    [showModal, hideModal]
  );

  const showError = useCallback(
    (message: string, title: string = 'Error', onClose?: () => void) => {
      showModal({
        message,
        title,
        type: 'error',
        onClose: () => {
          hideModal();
          onClose?.();
        },
      });
    },
    [showModal, hideModal]
  );

  const showInfo = useCallback(
    (message: string, title: string = 'Information', onClose?: () => void) => {
      showModal({
        message,
        title,
        type: 'info',
        onClose: () => {
          hideModal();
          onClose?.();
        },
      });
    },
    [showModal, hideModal]
  );

  const showWarning = useCallback(
    (message: string, title: string = 'Warning', onClose?: () => void) => {
      showModal({
        message,
        title,
        type: 'warning',
        onClose: () => {
          hideModal();
          onClose?.();
        },
      });
    },
    [showModal, hideModal]
  );

  const showConfirm = useCallback(
    (
      message: string,
      onConfirm: () => void,
      title: string = 'Confirm',
      confirmText: string = 'Confirm',
      cancelText: string = 'Cancel'
    ) => {
      const buttons: ModalButton[] = [
        {
          text: cancelText,
          onPress: hideModal,
          style: 'cancel',
        },
        {
          text: confirmText,
          onPress: () => {
            hideModal();
            onConfirm();
          },
          style: 'default',
        },
      ];

      showModal({
        message,
        title,
        type: 'confirm',
        buttons,
        showCloseButton: false,
      });
    },
    [showModal, hideModal]
  );

  return (
    <ModalContext.Provider
      value={{
        showModal,
        hideModal,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        showConfirm,
      }}
    >
      {children}
      <AppModal {...modalProps} />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};

