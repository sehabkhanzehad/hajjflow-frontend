"use client"

import * as React from "react"
import { useTranslation } from 'react-i18next'

import { Button } from "@/components/ui/button"

export function LanguageToggle() {
    const { i18n } = useTranslation()

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'bn' : 'en'
        i18n.changeLanguage(newLang)
    }

    return (
        <Button variant="outline" size="icon" onClick={toggleLanguage}>
            {i18n.language === 'en' ? 'বাং' : 'EN'}
        </Button>
    )
}