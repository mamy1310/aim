import { getTranslations } from 'next-intl/server';
import Typography from '@mui/material/Typography';

import CourseForm from '../../../_components/CourseForm';
import { serif } from '../../../../_components/styles';

export default async function NewCoursePage() {
  const t = await getTranslations('admin.course');

  return (
    <>
      <Typography component="h1" sx={{ ...serif, fontSize: '28px', fontWeight: 500, mb: 3 }}>
        {t('newTitle')}
      </Typography>
      <CourseForm
        courseId={null}
        initial={{
          slug: '',
          title: '',
          description: '',
          level: 1,
          order: 1,
          published: false,
          aiAssisted: false,
        }}
      />
    </>
  );
}
